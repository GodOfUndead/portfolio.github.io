/**
 * WebSocket Integration
 * Handles real-time communication for the Discord Clone
 */

// Create a connection to the backend server
let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; // 3 seconds
const BACKEND_URL = 'wss://websocket-node-service.onrender.com'; // Our free tier WebSocket service

// Store local states
const onlineUsers = new Map(); // userId -> user data
let pendingFriendRequests = [];
let friends = [];

// Initialize WebSocket connection
function initializeSocket() {
    if (!window.auth || !window.auth.isLoggedIn()) {
        console.log('User not logged in. WebSocket connection not established.');
        return;
    }

    const currentUser = window.auth.getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
        console.log('No valid user data. WebSocket connection not established.');
        return;
    }

    try {
        // Use WebSocket instead of Socket.io for simplicity in this implementation
        socket = new WebSocket(BACKEND_URL);
        
        socket.onopen = () => {
            console.log('WebSocket connection established');
            reconnectAttempts = 0;
            
            // Log the user in to the WebSocket server
            login(currentUser.id, currentUser.username);
            
            // Load friends from localStorage
            loadFriendsFromStorage();
        };
        
        socket.onmessage = (event) => {
            handleSocketMessage(event.data);
        };
        
        socket.onclose = (event) => {
            console.log('WebSocket connection closed', event.code, event.reason);
            handleSocketDisconnection();
        };
        
        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    } catch (err) {
        console.error('Failed to create WebSocket connection:', err);
        handleSocketDisconnection();
        
        // Create mock socket for development testing
        createMockSocketForTesting(currentUser);
    }
}

// Mock socket for offline development/testing when server is unavailable
function createMockSocketForTesting(currentUser) {
    console.log('Creating mock socket for testing/development...');
    
    // Load mock friends/users from localStorage if available
    let mockUsers = [];
    if (localStorage.getItem('discord_mock_users')) {
        try {
            mockUsers = JSON.parse(localStorage.getItem('discord_mock_users'));
        } catch (e) {
            console.error('Error loading mock users from localStorage', e);
        }
    }
    
    // Create some mock users if none exist
    if (mockUsers.length === 0) {
        mockUsers = [
            {
                id: 'mock-user-1',
                username: 'MockUser1',
                status: 'online',
                avatar: 'assets/default-avatar.png'
            },
            {
                id: 'mock-user-2',
                username: 'MockUser2',
                status: 'online',
                avatar: 'assets/default-avatar.png'
            },
            {
                id: 'mock-user-3',
                username: 'MockUser3',
                status: 'idle',
                avatar: 'assets/default-avatar.png'
            },
            {
                id: 'mock-user-4',
                username: 'MockUser4',
                status: 'offline',
                avatar: 'assets/default-avatar.png'
            }
        ];
        
        localStorage.setItem('discord_mock_users', JSON.stringify(mockUsers));
    }
    
    // Set our current user as online
    mockUsers.forEach(user => {
        if (user.id !== currentUser.id) {
            onlineUsers.set(user.id, user);
        }
    });
    
    // Load friends
    const storedFriends = localStorage.getItem('discord_friends');
    if (storedFriends) {
        try {
            friends = JSON.parse(storedFriends);
        } catch (e) {
            console.error('Error loading friends from localStorage', e);
            friends = [];
        }
    } else {
        // Create mock friend relationships
        friends = mockUsers.slice(0, 2).map(user => ({
            userId: currentUser.id,
            friendId: user.id,
            status: 'accepted',
            createdAt: new Date().toISOString()
        }));
        
        localStorage.setItem('discord_friends', JSON.stringify(friends));
    }
    
    // Update UI with friends
    updateFriendsList();
    
    // Simulate receiving a message after a delay
    setTimeout(() => {
        if (mockUsers.length > 0) {
            const mockUser = mockUsers[0];
            const mockMessage = {
                type: 'new_message',
                data: {
                    from: mockUser.id,
                    message: 'Hey there! This is a test message from the mock WebSocket service.',
                    timestamp: new Date().toISOString()
                }
            };
            
            handleSocketMessage(JSON.stringify(mockMessage));
        }
    }, 2000);
    
    // Simulate friend request after a delay
    setTimeout(() => {
        if (mockUsers.length > 2) {
            const mockUser = mockUsers[2];
            const mockRequest = {
                type: 'friend_request',
                data: {
                    from: mockUser.id,
                    username: mockUser.username,
                    avatar: mockUser.avatar,
                    timestamp: new Date().toISOString()
                }
            };
            
            handleSocketMessage(JSON.stringify(mockRequest));
        }
    }, 5000);
}

// Handle WebSocket disconnection
function handleSocketDisconnection() {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
        
        setTimeout(() => {
            initializeSocket();
        }, RECONNECT_DELAY);
    } else {
        console.log('Max reconnection attempts reached. Using local mode.');
        if (window.auth && window.auth.isLoggedIn()) {
            createMockSocketForTesting(window.auth.getCurrentUser());
        }
    }
}

// Send a message to the WebSocket server
function sendSocketMessage(type, data) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.log('WebSocket not connected. Message not sent:', type, data);
        return false;
    }

    try {
        socket.send(JSON.stringify({ type, data }));
        return true;
    } catch (error) {
        console.error('Error sending message:', error);
        return false;
    }
}

// Handle incoming WebSocket messages
function handleSocketMessage(message) {
    try {
        const data = JSON.parse(message);
        
        switch(data.type) {
            case 'online_users':
                handleOnlineUsers(data.data);
                break;
            case 'status_change':
                handleStatusChange(data.data);
                break;
            case 'new_message':
                handleNewMessage(data.data);
                break;
            case 'friend_request':
                handleFriendRequest(data.data);
                break;
            case 'friend_response':
                handleFriendResponse(data.data);
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    } catch (error) {
        console.error('Error handling message:', error, message);
    }
}

// Login to the WebSocket server
function login(userId, username) {
    if (!socket) return;
    
    const user = window.auth.getCurrentUser();
    
    sendSocketMessage('login', {
        userId,
        username,
        avatar: user.avatar,
        status: 'online'
    });
}

// Handle online users data
function handleOnlineUsers(users) {
    onlineUsers.clear();
    users.forEach(user => {
        onlineUsers.set(user.id, user);
    });
    
    updateFriendsList();
}

// Handle status change
function handleStatusChange(data) {
    const { userId, status } = data;
    
    if (onlineUsers.has(userId)) {
        const user = onlineUsers.get(userId);
        user.status = status;
        onlineUsers.set(userId, user);
    } else if (status === 'online') {
        onlineUsers.set(userId, {
            id: userId,
            status
        });
    }
    
    updateFriendsList();
}

// Handle new private message
function handleNewMessage(data) {
    const { from, message, timestamp } = data;
    
    // Get sender information
    let sender;
    if (onlineUsers.has(from)) {
        sender = onlineUsers.get(from);
    } else {
        sender = window.auth.getUserById(from) || { id: from, username: 'Unknown User' };
    }
    
    // Create notification for message if not in DM with this user
    const currentChannelId = window.servers ? window.servers.getCurrentChannelId() : null;
    const isDMChannel = currentChannelId && currentChannelId.startsWith('dm-');
    const isDMWithSender = isDMChannel && currentChannelId === `dm-${from}`;
    
    if (!isDMWithSender) {
        showNotification(`New message from ${sender.username}`, message);
    }
    
    // If we're in a DM with this user, add message to the chat
    if (isDMWithSender && window.chat) {
        window.chat.addMessage({
            id: generateId(),
            channelId: currentChannelId,
            userId: from,
            content: message,
            timestamp: timestamp || new Date().toISOString(),
            type: 'text'
        });
    }
}

// Handle friend request
function handleFriendRequest(data) {
    const { from, username, avatar, timestamp } = data;
    
    // Check if we already have this request
    const existingRequest = pendingFriendRequests.find(req => req.from === from);
    if (existingRequest) return;
    
    // Add to pending requests
    pendingFriendRequests.push({ from, username, avatar, timestamp });
    
    // Store in localStorage
    saveFriendsToStorage();
    
    // Show notification
    showNotification('Friend Request', `${username} sent you a friend request!`);
    
    // Show friend request notification badge
    updateFriendRequestBadge();
}

// Handle friend request response
function handleFriendResponse(data) {
    const { userId, status } = data;
    
    // Find the friend request
    const friendIndex = friends.findIndex(f => f.friendId === userId);
    
    if (friendIndex !== -1) {
        friends[friendIndex].status = status;
    } else {
        friends.push({
            userId: window.auth.getCurrentUser().id,
            friendId: userId,
            status,
            createdAt: new Date().toISOString()
        });
    }
    
    // Store in localStorage
    saveFriendsToStorage();
    
    // Update UI
    updateFriendsList();
    
    // Show notification
    if (status === 'accepted') {
        const user = window.auth.getUserById(userId) || { username: 'Someone' };
        showNotification('Friend Added', `${user.username} accepted your friend request!`);
    }
}

// Send a direct message to another user
function sendPrivateMessage(to, message) {
    if (!window.auth || !window.auth.isLoggedIn()) return;
    
    const currentUser = window.auth.getCurrentUser();
    
    if (socket && socket.readyState === WebSocket.OPEN) {
        sendSocketMessage('private_message', {
            to,
            from: currentUser.id,
            message,
            timestamp: new Date().toISOString()
        });
        
        return true;
    } else {
        // Mock message sending for offline development
        console.log('Using mock message sending...');
        
        // Create mock message object
        const mockMessageResponse = {
            type: 'new_message',
            data: {
                from: currentUser.id,
                to,
                message,
                timestamp: new Date().toISOString()
            }
        };
        
        // Process the message immediately
        setTimeout(() => {
            handleSocketMessage(JSON.stringify(mockMessageResponse));
        }, 100);
        
        // Create mock response from recipient after delay
        setTimeout(() => {
            const targetUser = window.auth.getUserById(to);
            if (targetUser) {
                const mockResponse = {
                    type: 'new_message',
                    data: {
                        from: to,
                        to: currentUser.id,
                        message: `Hi! This is an automated response from ${targetUser.username}. The server is offline, so this is just a mock response.`,
                        timestamp: new Date().toISOString()
                    }
                };
                
                handleSocketMessage(JSON.stringify(mockResponse));
            }
        }, 2000);
        
        return true;
    }
}

// Send a friend request to another user
function sendFriendRequest(to) {
    if (!window.auth || !window.auth.isLoggedIn()) return;
    
    const currentUser = window.auth.getCurrentUser();
    
    // Get or create friends array
    let friends = [];
    if (localStorage.getItem('discord_friends')) {
        try {
            friends = JSON.parse(localStorage.getItem('discord_friends'));
        } catch (e) {
            console.error('Error loading friends from localStorage', e);
        }
    }
    
    // Create friend request object
    const request = {
        userId: currentUser.id,
        friendId: to,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Check if request already exists
    const existingRequest = friends.find(f => 
        (f.userId === currentUser.id && f.friendId === to) || 
        (f.userId === to && f.friendId === currentUser.id)
    );
    
    if (existingRequest) {
        console.log('Friend request already exists');
        return false;
    }
    
    // Add to array
    friends.push(request);
    
    // Save to localStorage
    localStorage.setItem('discord_friends', JSON.stringify(friends));
    
    // Send via WebSocket if connected
    if (socket && socket.readyState === WebSocket.OPEN) {
        sendSocketMessage('friend_request', {
            to,
            from: currentUser.id,
            timestamp: new Date().toISOString()
        });
        
        return true;
    } else {
        // Mock request acceptance for offline development
        console.log('Using mock friend request acceptance...');
        
        // Get target user data
        const targetUser = window.auth.getUserById(to);
        
        if (targetUser) {
            // Create mock request object
            const mockRequest = {
                type: 'friend_request',
                data: {
                    from: currentUser.id,
                    to,
                    username: currentUser.username,
                    avatar: currentUser.avatar,
                    timestamp: new Date().toISOString()
                }
            };
            
            // Process request immediately
            setTimeout(() => {
                handleSocketMessage(JSON.stringify(mockRequest));
            }, 100);
            
            // Create mock acceptance after delay
            setTimeout(() => {
                const mockResponse = {
                    type: 'friend_response',
                    data: {
                        from: to,
                        to: currentUser.id,
                        accepted: true,
                        timestamp: new Date().toISOString()
                    }
                };
                
                handleSocketMessage(JSON.stringify(mockResponse));
            }, 3000);
        }
        
        return true;
    }
}

// Respond to a friend request
function respondToFriendRequest(from, accept) {
    // Remove from pending requests
    pendingFriendRequests = pendingFriendRequests.filter(req => req.from !== from);
    
    // If accepted, add to friends list
    if (accept) {
        const existingFriend = friends.find(f => f.friendId === from);
        
        if (!existingFriend) {
            friends.push({
                userId: window.auth.getCurrentUser().id,
                friendId: from,
                status: 'accepted',
                createdAt: new Date().toISOString()
            });
        } else {
            existingFriend.status = 'accepted';
        }
    }
    
    // Store in localStorage
    saveFriendsToStorage();
    
    // Update UI
    updateFriendsList();
    updateFriendRequestBadge();
    
    // Send response to server
    return sendSocketMessage('friend_response', {
        to: from,
        accept
    });
}

// Set user status
function setUserStatus(status) {
    if (!window.auth || !window.auth.isLoggedIn()) return;
    
    const currentUser = window.auth.getCurrentUser();
    
    // Update local user status
    currentUser.status = status;
    localStorage.setItem('discord_current_user', JSON.stringify(currentUser));
    
    // Send to server
    sendSocketMessage('status_change', { status });
    
    // Update UI
    updateUserStatusUI();
}

// Update the user status in the UI
function updateUserStatusUI() {
    if (!window.auth || !window.auth.isLoggedIn()) return;
    
    const currentUser = window.auth.getCurrentUser();
    const statusButtons = document.querySelectorAll('.status-option');
    
    statusButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.status === currentUser.status) {
            btn.classList.add('active');
        }
    });
    
    // Update user status indicator
    const userStatusIndicator = document.querySelector('.user-status-indicator');
    if (userStatusIndicator) {
        userStatusIndicator.className = `user-status-indicator status-${currentUser.status}`;
    }
}

// Update the friends list in the UI
function updateFriendsList() {
    if (!window.auth || !window.auth.isLoggedIn()) return;
    
    // Get current user
    const currentUser = window.auth.getCurrentUser();
    
    // Filter friends
    const acceptedFriends = friends.filter(f => f.status === 'accepted');
    
    // Get online and offline friends
    const onlineFriends = [];
    const offlineFriends = [];
    
    acceptedFriends.forEach(friend => {
        const userId = friend.userId === currentUser.id ? friend.friendId : friend.userId;
        const user = window.auth.getUserById(userId);
        
        if (!user) return;
        
        // Check if the user is online
        const isOnline = onlineUsers.has(userId);
        const userWithStatus = {
            ...user,
            status: isOnline ? onlineUsers.get(userId).status : 'offline'
        };
        
        if (isOnline && userWithStatus.status !== 'offline') {
            onlineFriends.push(userWithStatus);
        } else {
            offlineFriends.push(userWithStatus);
        }
    });
    
    // Update the members sidebar if it's available
    if (window.chat && window.chat.renderMembers) {
        window.chat.renderMembers(onlineFriends, offlineFriends);
    }
    
    // Update friends list in dedicated friends UI, if available
    updateFriendsUI(onlineFriends, offlineFriends);
}

// Update the friends list UI in the dedicated friends tab
function updateFriendsUI(onlineFriends, offlineFriends) {
    const friendsOnlineList = document.getElementById('friends-online-list');
    const friendsOfflineList = document.getElementById('friends-offline-list');
    const friendsOnlineCount = document.getElementById('friends-online-count');
    const friendsOfflineCount = document.getElementById('friends-offline-count');
    
    if (!friendsOnlineList || !friendsOfflineList) return;
    
    // Update counts
    if (friendsOnlineCount) {
        friendsOnlineCount.textContent = onlineFriends.length;
    }
    
    if (friendsOfflineCount) {
        friendsOfflineCount.textContent = offlineFriends.length;
    }
    
    // Clear existing lists
    friendsOnlineList.innerHTML = '';
    friendsOfflineList.innerHTML = '';
    
    // Add online friends
    onlineFriends.forEach(friend => {
        const friendElement = createFriendElement(friend);
        friendsOnlineList.appendChild(friendElement);
    });
    
    // Add offline friends
    offlineFriends.forEach(friend => {
        const friendElement = createFriendElement(friend);
        friendsOfflineList.appendChild(friendElement);
    });
}

// Create a friend element for the UI
function createFriendElement(friend) {
    const friendElement = document.createElement('div');
    friendElement.className = 'member';
    friendElement.dataset.userId = friend.id;
    
    // Add click handler for messaging
    friendElement.addEventListener('click', () => {
        openDirectMessage(friend.id);
    });
    
    // Set content
    friendElement.innerHTML = `
        <div class="member-avatar">
            <img src="${friend.avatar || 'assets/default-avatar.png'}" alt="${friend.username}">
            <div class="status-indicator status-${friend.status || 'offline'}"></div>
        </div>
        <div class="member-info">
            <div class="member-name">${friend.username}</div>
            <div class="member-status">${friend.status || 'offline'}</div>
        </div>
        <div class="member-actions">
            <button class="member-action message-btn" title="Message">
                <i class="fas fa-comment"></i>
            </button>
        </div>
    `;
    
    return friendElement;
}

// Update the friend request badge
function updateFriendRequestBadge() {
    const badge = document.getElementById('friend-requests-badge');
    
    if (!badge) return;
    
    if (pendingFriendRequests.length > 0) {
        badge.textContent = pendingFriendRequests.length;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// Open direct message with a user
function openDirectMessage(userId) {
    if (!window.servers) return;
    
    const dmChannelId = `dm-${userId}`;
    
    // Check if channel exists
    let channel = window.servers.getChannelById(dmChannelId);
    
    if (!channel) {
        // Create new DM channel
        const user = window.auth.getUserById(userId);
        
        if (!user) {
            console.error('User not found:', userId);
            return;
        }
        
        // Create DM channel
        channel = {
            id: dmChannelId,
            name: user.username,
            type: 'dm',
            recipientId: userId,
            createdAt: new Date().toISOString()
        };
        
        // Add to channels
        window.servers.addChannel(channel);
    }
    
    // Switch to this channel
    window.servers.switchChannel(dmChannelId);
}

// Show a notification
function showNotification(title, message) {
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notifications");
        return;
    }
    
    // Check if permission is already granted
    if (Notification.permission === "granted") {
        createNotification(title, message);
    }
    // Otherwise, ask for permission
    else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                createNotification(title, message);
            }
        });
    }
    
    // Also create an in-app notification
    createInAppNotification(title, message);
}

// Create a desktop notification
function createNotification(title, message) {
    const notification = new Notification(title, {
        body: message,
        icon: 'assets/discord-logo.png'
    });
    
    notification.onclick = function() {
        window.focus();
        this.close();
    };
    
    // Auto close after 5 seconds
    setTimeout(() => {
        notification.close();
    }, 5000);
}

// Create an in-app notification
function createInAppNotification(title, message) {
    // Create notification element
    const notificationEl = document.createElement('div');
    notificationEl.className = 'in-app-notification';
    
    notificationEl.innerHTML = `
        <div class="notification-header">
            <h4>${title}</h4>
            <button class="close-notification">×</button>
        </div>
        <div class="notification-body">
            <p>${message}</p>
        </div>
    `;
    
    // Add close handler
    notificationEl.querySelector('.close-notification').addEventListener('click', () => {
        document.body.removeChild(notificationEl);
    });
    
    // Add to document
    document.body.appendChild(notificationEl);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notificationEl)) {
            document.body.removeChild(notificationEl);
        }
    }, 5000);
}

// Load friends list from localStorage
function loadFriendsFromStorage() {
    // Load friends
    const storedFriends = localStorage.getItem('discord_friends');
    if (storedFriends) {
        try {
            friends = JSON.parse(storedFriends);
        } catch (e) {
            console.error('Error loading friends from localStorage', e);
            friends = [];
        }
    }
    
    // Load pending requests
    const storedRequests = localStorage.getItem('discord_friend_requests');
    if (storedRequests) {
        try {
            pendingFriendRequests = JSON.parse(storedRequests);
        } catch (e) {
            console.error('Error loading friend requests from localStorage', e);
            pendingFriendRequests = [];
        }
    }
    
    // Update UI
    updateFriendsList();
    updateFriendRequestBadge();
}

// Save friends to localStorage
function saveFriendsToStorage() {
    localStorage.setItem('discord_friends', JSON.stringify(friends));
    localStorage.setItem('discord_friend_requests', JSON.stringify(pendingFriendRequests));
}

// Generate a unique ID for messages/channels
function generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// Initialize WebSocket when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for auth module to be ready
    setTimeout(() => {
        if (window.auth && window.auth.isLoggedIn()) {
            initializeSocket();
        }
    }, 1000);
    
    // Re-initialize when user logs in
    document.addEventListener('user-logged-in', () => {
        initializeSocket();
    });
    
    // Clean up when user logs out
    document.addEventListener('user-logged-out', () => {
        if (socket) {
            socket.close();
            socket = null;
        }
    });
});

// Get all friends
function getFriends() {
    return friends || [];
}

// Get pending friend requests for the current user
function getPendingFriendRequests() {
    if (!window.auth || !window.auth.isLoggedIn()) return [];
    
    const currentUser = window.auth.getCurrentUser();
    if (!currentUser) return [];
    
    return friends.filter(f => 
        f.friendId === currentUser.id && 
        f.status === 'pending'
    );
}

// Expose necessary functions to other modules
window.socket = {
    initializeSocket,
    sendPrivateMessage,
    sendFriendRequest,
    respondToFriendRequest,
    setUserStatus,
    openDirectMessage,
    getFriends,
    getPendingFriendRequests,
    updateFriendsList
}; 