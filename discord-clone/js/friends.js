/**
 * Friends Module
 * Handles the friends list UI, friend requests, and direct messages
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize friends UI once DOM is loaded
    initializeFriendsUI();
});

// Initialize the friends UI
function initializeFriendsUI() {
    // Add Friends tab to the channel sidebar
    addFriendsTabToSidebar();
    
    // Create friends container in the chat area
    createFriendsContainer();
    
    // Add friend request badge to the friends tab
    if (window.socket) {
        updateFriendRequestBadge();
    }
    
    // Add event listeners for status dropdown
    setupStatusDropdown();
    
    // Add event listeners to hide friends UI when clicking on servers or channels
    setupServerChannelListeners();
}

// Add friends tab to the sidebar
function addFriendsTabToSidebar() {
    const textChannels = document.getElementById('text-channels');
    if (!textChannels) return;
    
    // Create a friends tab at the top of text channels
    const friendsTab = document.createElement('div');
    friendsTab.className = 'channel';
    friendsTab.id = 'friends-tab';
    friendsTab.innerHTML = `
        <i class="fas fa-user-friends"></i>
        <span>Friends</span>
        <div id="friend-requests-badge" class="friends-badge">0</div>
    `;
    
    // Insert at the beginning
    textChannels.insertBefore(friendsTab, textChannels.firstChild);
    
    // Add click event
    friendsTab.addEventListener('click', () => {
        // Remove active class from all channels
        document.querySelectorAll('.channel').forEach(channel => {
            channel.classList.remove('active');
        });
        
        // Add active class to friends tab
        friendsTab.classList.add('active');
        
        // Show friends UI
        showFriendsUI();
        
        // Update channel header
        document.getElementById('current-channel').textContent = 'Friends';
        
        // Replace hashtag icon with users icon
        const channelIcon = document.querySelector('.chat-header-left i');
        channelIcon.className = 'fas fa-user-friends';
    });
}

// Create friends container in the chat area
function createFriendsContainer() {
    const friendsContainer = document.createElement('div');
    friendsContainer.className = 'friends-container';
    friendsContainer.id = 'friends-container';
    friendsContainer.style.display = 'none';
    
    friendsContainer.innerHTML = `
        <div class="friends-header">
            <h2>Friends</h2>
            <div class="friends-header-tabs">
                <div class="friends-tab active" data-tab="online">Online</div>
                <div class="friends-tab" data-tab="all">All</div>
                <div class="friends-tab" data-tab="pending">Pending <span id="friends-pending-badge" class="friends-badge">0</span></div>
                <div class="friends-tab" data-tab="add">Add Friend</div>
            </div>
        </div>
        <div class="friends-content">
            <div class="friends-tab-content active" id="online-tab">
                <div class="friends-section">
                    <div class="friends-section-header">
                        <div class="friends-section-title">Online — <span id="friends-online-count">0</span></div>
                    </div>
                    <div class="friends-list" id="friends-online-list">
                        <!-- Online friends will be added here -->
                    </div>
                </div>
            </div>
            
            <div class="friends-tab-content" id="all-tab">
                <div class="friends-section">
                    <div class="friends-section-header">
                        <div class="friends-section-title">Online — <span id="all-friends-online-count">0</span></div>
                    </div>
                    <div class="friends-list" id="all-friends-online-list">
                        <!-- Online friends will be added here -->
                    </div>
                </div>
                <div class="friends-section">
                    <div class="friends-section-header">
                        <div class="friends-section-title">Offline — <span id="all-friends-offline-count">0</span></div>
                    </div>
                    <div class="friends-list" id="all-friends-offline-list">
                        <!-- Offline friends will be added here -->
                    </div>
                </div>
            </div>
            
            <div class="friends-tab-content" id="pending-tab">
                <div class="friends-section">
                    <div class="friends-section-header">
                        <div class="friends-section-title">Pending Friend Requests — <span id="pending-count">0</span></div>
                    </div>
                    <div class="friends-list" id="pending-requests-list">
                        <!-- Pending requests will be added here -->
                        <div class="empty-friend-state" id="empty-pending-state" style="display: none;">
                            <i class="fas fa-user-friends"></i>
                            <h4>No pending friend requests</h4>
                            <p>When you receive friend requests or send them, they'll show up here.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="friends-tab-content" id="add-tab">
                <div class="add-friend-form">
                    <h3>ADD FRIEND</h3>
                    <p>You can add a friend with their username. Make sure to get the spelling right!</p>
                    <div class="add-friend-input-group">
                        <input type="text" class="add-friend-input" id="add-friend-input" placeholder="Enter a username#0000">
                        <button class="add-friend-button" id="add-friend-button"><i class="fas fa-user-plus"></i> Send Friend Request</button>
                    </div>
                    <div id="add-friend-message"></div>
                </div>
            </div>
        </div>
    `;
    
    // Add to the chat messages container (we'll toggle visibility)
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.insertAdjacentElement('afterend', friendsContainer);
    
    // Add tab switching functionality
    const tabs = friendsContainer.querySelectorAll('.friends-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all tab contents
            const tabContents = friendsContainer.querySelectorAll('.friends-tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Show selected tab content
            const tabContent = document.getElementById(`${tab.dataset.tab}-tab`);
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });
    
    // Add event listener for add friend button
    const addFriendButton = document.getElementById('add-friend-button');
    const addFriendInput = document.getElementById('add-friend-input');
    
    if (addFriendButton && addFriendInput) {
        addFriendButton.addEventListener('click', () => {
            sendFriendRequest();
        });
        
        addFriendInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                sendFriendRequest();
            }
        });
        
        // Add input validation feedback
        addFriendInput.addEventListener('input', () => {
            const username = addFriendInput.value.trim();
            if (username.length > 2) {
                addFriendInput.style.borderColor = 'rgba(108, 92, 231, 0.4)';
            } else {
                addFriendInput.style.borderColor = 'rgba(108, 92, 231, 0.2)';
            }
        });
    }
}

// Show friends UI
function showFriendsUI() {
    // Hide chat messages
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.style.display = 'none';
    }
    
    // Hide message input
    const messageInputContainer = document.querySelector('.message-input-container');
    if (messageInputContainer) {
        messageInputContainer.style.display = 'none';
    }
    
    // Show friends container
    const friendsContainer = document.getElementById('friends-container');
    if (friendsContainer) {
        friendsContainer.style.display = 'flex';
    }
    
    // Update friends list
    updateFriendsLists();
}

// Hide friends UI
function hideFriendsUI() {
    // Show chat messages
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.style.display = 'flex';
    }
    
    // Show message input
    const messageInputContainer = document.querySelector('.message-input-container');
    if (messageInputContainer) {
        messageInputContainer.style.display = 'block';
    }
    
    // Hide friends container
    const friendsContainer = document.getElementById('friends-container');
    if (friendsContainer) {
        friendsContainer.style.display = 'none';
    }
}

// Update friends lists in the UI
function updateFriendsLists() {
    if (!window.socket) return;
    
    // Get friends and pending requests
    const friends = window.socket.getFriends();
    const pendingRequests = window.socket.getPendingFriendRequests();
    
    // Update pending requests count and badge
    updateFriendRequestBadge(pendingRequests.length);
    
    // Get current user
    const currentUser = window.auth ? window.auth.getCurrentUser() : null;
    if (!currentUser) return;
    
    // Filter accepted friends
    const acceptedFriends = friends.filter(f => f.status === 'accepted');
    
    // Separate online and offline friends
    const onlineFriends = [];
    const offlineFriends = [];
    
    acceptedFriends.forEach(friend => {
        const userId = friend.userId === currentUser.id ? friend.friendId : friend.userId;
        const user = window.auth.getUserById(userId);
        
        if (!user) return;
        
        // Check if the user is online
        const isOnline = window.socket.isUserOnline(userId);
        const status = window.socket.getUserStatus(userId);
        
        const userWithStatus = {
            ...user,
            status: status || 'offline'
        };
        
        if (isOnline && status !== 'offline') {
            onlineFriends.push(userWithStatus);
        } else {
            offlineFriends.push(userWithStatus);
        }
    });
    
    // Update friend counts
    document.getElementById('friends-online-count').textContent = onlineFriends.length;
    document.getElementById('all-friends-online-count').textContent = onlineFriends.length;
    document.getElementById('all-friends-offline-count').textContent = offlineFriends.length;
    document.getElementById('pending-count').textContent = pendingRequests.length;
    
    // Clear existing lists
    document.getElementById('friends-online-list').innerHTML = '';
    document.getElementById('all-friends-online-list').innerHTML = '';
    document.getElementById('all-friends-offline-list').innerHTML = '';
    document.getElementById('pending-requests-list').innerHTML = '';
    
    // Add online friends to lists
    onlineFriends.forEach(friend => {
        const friendElement = createFriendElement(friend);
        document.getElementById('friends-online-list').appendChild(friendElement.cloneNode(true));
        document.getElementById('all-friends-online-list').appendChild(friendElement);
    });
    
    // Add offline friends to list
    offlineFriends.forEach(friend => {
        const friendElement = createFriendElement(friend);
        document.getElementById('all-friends-offline-list').appendChild(friendElement);
    });
    
    // Add pending requests
    pendingRequests.forEach(request => {
        const requestElement = createFriendRequestElement(request);
        document.getElementById('pending-requests-list').appendChild(requestElement);
    });
    
    // Add event listeners to new elements
    addFriendElementEventListeners();
    
    // Show or hide empty state for pending requests
    const emptyPendingState = document.getElementById('empty-pending-state');
    const pendingRequestsList = document.getElementById('pending-requests-list');
    
    if (emptyPendingState && pendingRequestsList) {
        if (pendingRequests.length === 0) {
            // Show empty state
            emptyPendingState.style.display = 'flex';
            
            // Remove any existing requests from DOM (if any were previously shown)
            const existingRequests = pendingRequestsList.querySelectorAll('.friend-request');
            existingRequests.forEach(req => {
                if (req !== emptyPendingState) {
                    req.remove();
                }
            });
        } else {
            // Hide empty state
            emptyPendingState.style.display = 'none';
        }
    }
}

// Create a friend element
function createFriendElement(friend) {
    const friendElement = document.createElement('div');
    friendElement.className = 'member';
    friendElement.dataset.userId = friend.id;
    
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

// Create a friend request element
function createFriendRequestElement(request) {
    const requestElement = document.createElement('div');
    requestElement.className = 'friend-request';
    requestElement.dataset.userId = request.from;
    
    requestElement.innerHTML = `
        <div class="friend-request-avatar">
            <img src="${request.avatar || 'assets/default-avatar.png'}" alt="${request.username}">
        </div>
        <div class="friend-request-info">
            <div class="friend-request-name">${request.username}</div>
            <div class="friend-request-subtitle">Incoming Friend Request</div>
        </div>
        <div class="friend-request-actions">
            <button class="friend-request-button accept-request">Accept</button>
            <button class="friend-request-button decline-request">Decline</button>
        </div>
    `;
    
    return requestElement;
}

// Add event listeners to friend elements
function addFriendElementEventListeners() {
    // Message buttons
    const messageButtons = document.querySelectorAll('.message-btn');
    messageButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const userId = btn.closest('.member').dataset.userId;
            openDirectMessage(userId);
        });
    });
    
    // Friend click (also opens message)
    const friendElements = document.querySelectorAll('.member');
    friendElements.forEach(el => {
        el.addEventListener('click', () => {
            const userId = el.dataset.userId;
            openDirectMessage(userId);
        });
    });
    
    // Friend request accept/decline buttons
    const acceptButtons = document.querySelectorAll('.accept-request');
    const declineButtons = document.querySelectorAll('.decline-request');
    
    acceptButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = btn.closest('.friend-request').dataset.userId;
            respondToFriendRequest(userId, true);
        });
    });
    
    declineButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = btn.closest('.friend-request').dataset.userId;
            respondToFriendRequest(userId, false);
        });
    });
}

// Send a friend request
function sendFriendRequest() {
    if (!window.socket) {
        showAddFriendMessage('Unable to connect to server. Friend requests are not available at this time.', 'error');
        return;
    }
    
    const input = document.getElementById('add-friend-input');
    const button = document.getElementById('add-friend-button');
    const username = input ? input.value.trim() : '';
    
    if (!username) {
        showAddFriendMessage('Please enter a username', 'error');
        input.focus();
        return;
    }
    
    // Show sending animation
    if (button) {
        button.classList.add('sending');
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    }
    
    // Check if user exists
    const currentUser = window.auth.getCurrentUser();
    if (!currentUser) {
        showAddFriendMessage('You need to be logged in to add friends', 'error');
        resetAddFriendButton(button);
        return;
    }
    
    // Check if trying to add self
    if (username === currentUser.username) {
        showAddFriendMessage('You cannot add yourself as a friend', 'error');
        resetAddFriendButton(button);
        return;
    }
    
    // Get all users from local storage
    const usersDB = localStorage.getItem('discord_users') ? 
        JSON.parse(localStorage.getItem('discord_users')) : [];
    
    // Find user by username
    const targetUser = usersDB.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!targetUser) {
        showAddFriendMessage(`User "${username}" not found`, 'error');
        resetAddFriendButton(button);
        return;
    }
    
    // Check if already friends or request pending
    const friends = window.socket.getFriends();
    const existingFriend = friends.find(f => 
        (f.userId === currentUser.id && f.friendId === targetUser.id) || 
        (f.userId === targetUser.id && f.friendId === currentUser.id)
    );
    
    if (existingFriend) {
        if (existingFriend.status === 'accepted') {
            showAddFriendMessage(`You are already friends with ${targetUser.username}`, 'error');
        } else if (existingFriend.status === 'pending') {
            if (existingFriend.userId === currentUser.id) {
                showAddFriendMessage(`Friend request to ${targetUser.username} already sent`, 'error');
            } else {
                showAddFriendMessage(`${targetUser.username} already sent you a friend request. Check your pending tab.`, 'success');
            }
        }
        resetAddFriendButton(button);
        return;
    }
    
    // Create friend request
    const request = {
        userId: currentUser.id,
        friendId: targetUser.id,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Add to friends array
    friends.push(request);
    
    // Save to localStorage
    localStorage.setItem('discord_friends', JSON.stringify(friends));
    
    // Update UI
    updateFriendsLists();
    
    // Send notification to the other user (if connected)
    if (window.socket.sendFriendRequest) {
        window.socket.sendFriendRequest(targetUser.id);
        
        // Show success message after a short delay to simulate a server request
        setTimeout(() => {
            // Show success message
            showAddFriendMessage(`Friend request sent to ${targetUser.username}`, 'success');
            
            // Reset button
            resetAddFriendButton(button);
            
            // Clear input
            if (input) input.value = '';
        }, 1000);
        
    } else {
        // Mock the friend request response for demo
        setTimeout(() => {
            const responseRequest = {
                userId: targetUser.id,
                friendId: currentUser.id,
                status: 'accepted',
                createdAt: new Date().toISOString()
            };
            
            // Add acceptance to friends array
            friends.push(responseRequest);
            
            // Update existing request to accepted
            const requestIndex = friends.findIndex(f => 
                f.userId === currentUser.id && f.friendId === targetUser.id
            );
            
            if (requestIndex !== -1) {
                friends[requestIndex].status = 'accepted';
            }
            
            // Save to localStorage
            localStorage.setItem('discord_friends', JSON.stringify(friends));
            
            // Update UI
            updateFriendsLists();
            
            // Show success message
            showAddFriendMessage(`${targetUser.username} accepted your friend request!`, 'success');
            
            // Show notification
            showNotification('Friend Request Accepted', `${targetUser.username} accepted your friend request!`);
            
            // Reset button
            resetAddFriendButton(button);
            
            // Clear input
            if (input) input.value = '';
            
        }, 2000);
    }
}

// Reset add friend button to its original state
function resetAddFriendButton(button) {
    if (!button) return;
    
    button.classList.remove('sending');
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-user-plus"></i> Send Friend Request';
}

// Show add friend message
function showAddFriendMessage(message, type) {
    const messageContainer = document.getElementById('add-friend-message');
    if (!messageContainer) return;
    
    messageContainer.className = type === 'error' ? 'add-friend-error' : 'add-friend-success';
    messageContainer.textContent = message;
    messageContainer.style.display = 'flex';
    
    // Scroll to message if needed
    messageContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Clear after 5 seconds
    setTimeout(() => {
        if (messageContainer.textContent === message) { // Check if it's still the same message
            messageContainer.style.opacity = '0';
            
            setTimeout(() => {
                messageContainer.textContent = '';
                messageContainer.className = '';
                messageContainer.style.display = 'none';
                messageContainer.style.opacity = '1';
            }, 300);
        }
    }, 5000);
}

// Respond to friend request
function respondToFriendRequest(userId, accept) {
    if (!window.socket) return;
    
    window.socket.respondToFriendRequest(userId, accept);
    
    // Update UI
    updateFriendsLists();
    
    // Show notification
    const user = window.auth.getUserById(userId);
    const message = accept ? 
        `You are now friends with ${user ? user.username : 'this user'}` :
        `Friend request declined`;
    
    showNotification('Friend Request', message);
}

// Open direct message with a user
function openDirectMessage(userId) {
    if (!window.socket) return;
    
    window.socket.openDirectMessage(userId);
    
    // Hide friends UI and show chat
    hideFriendsUI();
    
    // Update active channel in sidebar
    document.querySelectorAll('.channel').forEach(channel => {
        channel.classList.remove('active');
    });
}

// Update friend request badge
function updateFriendRequestBadge(count) {
    const badge = document.getElementById('friend-requests-badge');
    const pendingBadge = document.getElementById('friends-pending-badge');
    
    if (!badge || !pendingBadge) return;
    
    // If count not provided, get from socket
    if (count === undefined && window.socket) {
        count = window.socket.getPendingFriendRequests().length;
    }
    
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'flex';
        
        pendingBadge.textContent = count;
        pendingBadge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
        pendingBadge.style.display = 'none';
    }
}

// Setup status dropdown
function setupStatusDropdown() {
    // Add status dropdown to user controls
    const userControls = document.querySelector('.user-controls');
    if (!userControls) return;
    
    // Create status dropdown
    const statusDropdown = document.createElement('div');
    statusDropdown.className = 'status-dropdown';
    statusDropdown.id = 'status-dropdown';
    
    statusDropdown.innerHTML = `
        <div class="status-option" data-status="online">
            <div class="status-dot online"></div>
            <div>Online</div>
        </div>
        <div class="status-option" data-status="idle">
            <div class="status-dot idle"></div>
            <div>Idle</div>
        </div>
        <div class="status-option" data-status="dnd">
            <div class="status-dot dnd"></div>
            <div>Do Not Disturb</div>
        </div>
        <div class="status-option" data-status="offline">
            <div class="status-dot offline"></div>
            <div>Invisible</div>
        </div>
    `;
    
    userControls.appendChild(statusDropdown);
    
    // Add status indicator to user avatar
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar) {
        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'user-status-indicator status-online';
        userAvatar.appendChild(statusIndicator);
    }
    
    // Add click event to user avatar to toggle dropdown
    userAvatar.addEventListener('click', (e) => {
        e.stopPropagation();
        statusDropdown.classList.toggle('active');
    });
    
    // Add click events to status options
    const statusOptions = document.querySelectorAll('.status-option');
    statusOptions.forEach(option => {
        option.addEventListener('click', () => {
            const status = option.dataset.status;
            setUserStatus(status);
            statusDropdown.classList.remove('active');
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!statusDropdown.contains(e.target) && !userAvatar.contains(e.target)) {
            statusDropdown.classList.remove('active');
        }
    });
    
    // Set initial status based on current user
    if (window.auth && window.auth.isLoggedIn()) {
        const currentUser = window.auth.getCurrentUser();
        if (currentUser && currentUser.status) {
            setUserStatus(currentUser.status);
        }
    }
}

// Set user status
function setUserStatus(status) {
    if (!window.socket) return;
    
    window.socket.setUserStatus(status);
    
    // Update UI
    const statusIndicator = document.querySelector('.user-status-indicator');
    if (statusIndicator) {
        statusIndicator.className = `user-status-indicator status-${status}`;
    }
    
    // Update status options
    const statusOptions = document.querySelectorAll('.status-option');
    statusOptions.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.status === status) {
            option.classList.add('active');
        }
    });
}

// Show notification
function showNotification(title, message) {
    if (window.socket) {
        // Use the socket module's notification function
        window.socket.showNotification(title, message);
    } else {
        // Simple notification if socket module not available
        alert(`${title}: ${message}`);
    }
}

// Update channel list when new channels are added
document.addEventListener('channels-updated', () => {
    // Add direct message section to sidebar if not exists
    addDirectMessageSection();
});

// Add direct message section to sidebar
function addDirectMessageSection() {
    const channelsContainer = document.querySelector('.channels-container');
    if (!channelsContainer) return;
    
    // Check if DM section already exists
    if (document.querySelector('.dm-list')) return;
    
    // Create DM section
    const dmSection = document.createElement('div');
    dmSection.className = 'channel-category';
    
    dmSection.innerHTML = `
        <div class="dm-header">
            <i class="fas fa-chevron-down"></i>
            <div>DIRECT MESSAGES</div>
        </div>
        <div class="dm-list" id="dm-channels">
            <!-- DM channels will be added here -->
        </div>
    `;
    
    // Add to channels container
    channelsContainer.appendChild(dmSection);
    
    // Update DM channels list
    updateDMChannelsList();
}

// Update DM channels list
function updateDMChannelsList() {
    const dmList = document.getElementById('dm-channels');
    if (!dmList || !window.servers) return;
    
    // Get all DM channels
    const channels = window.servers.getAllChannels();
    const dmChannels = channels.filter(channel => channel.type === 'dm');
    
    // Clear list
    dmList.innerHTML = '';
    
    // Add each DM channel
    dmChannels.forEach(channel => {
        const dmChannel = document.createElement('div');
        dmChannel.className = 'dm-channel';
        dmChannel.dataset.channelId = channel.id;
        
        // Get user info
        const userId = channel.recipientId;
        const user = window.auth.getUserById(userId);
        
        if (!user) return;
        
        // Get user status
        const status = window.socket ? window.socket.getUserStatus(userId) : 'offline';
        
        dmChannel.innerHTML = `
            <div class="dm-avatar">
                <img src="${user.avatar || 'assets/default-avatar.png'}" alt="${user.username}">
                <div class="status-indicator status-${status}"></div>
            </div>
            <div class="dm-details">
                <div class="dm-name">${user.username}</div>
            </div>
        `;
        
        // Add click event
        dmChannel.addEventListener('click', () => {
            window.servers.switchChannel(channel.id);
            hideFriendsUI();
        });
        
        dmList.appendChild(dmChannel);
    });
}

// Add event to update friends when the user logs in
document.addEventListener('user-logged-in', () => {
    // Initialize friends UI
    setTimeout(() => {
        initializeFriendsUI();
    }, 1000);
});

// Setup listeners to hide friends UI when clicking on servers or channels
function setupServerChannelListeners() {
    // Listen for clicks on server icons
    const serverIcons = document.querySelectorAll('.server-icon:not(#friends-tab)');
    serverIcons.forEach(icon => {
        icon.addEventListener('click', hideFriendsUI);
    });
    
    // Listen for clicks on text channels
    const textChannels = document.querySelectorAll('.channel:not(#friends-tab)');
    textChannels.forEach(channel => {
        channel.addEventListener('click', hideFriendsUI);
    });
    
    // Add listener for dynamically added servers and channels
    document.addEventListener('server-added', setupServerChannelListeners);
    document.addEventListener('channel-added', setupServerChannelListeners);
}

// Export functions to window
window.friends = {
    updateFriendsLists,
    updateFriendRequestBadge,
    updateDMChannelsList,
    showFriendsUI,
    hideFriendsUI
}; 