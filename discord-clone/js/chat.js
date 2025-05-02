/**
 * Chat Module
 * Handles message sending, receiving, and display
 */

// Mock database for demo purposes
let messagesDB = [];
let membersDB = []; // Tracks members in the chat for the sidebar

// Load data from localStorage
if (localStorage.getItem('discord_messages')) {
    try {
        messagesDB = JSON.parse(localStorage.getItem('discord_messages'));
    } catch (e) {
        console.error('Error loading messages from localStorage', e);
    }
}

if (localStorage.getItem('discord_members')) {
    try {
        membersDB = JSON.parse(localStorage.getItem('discord_members'));
    } catch (e) {
        console.error('Error loading members from localStorage', e);
    }
}

// Create some demo messages if none exist
if (messagesDB.length === 0 && window.servers) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            // Wait for servers to load
            const demoServer = localStorage.getItem('discord_servers') ? 
                JSON.parse(localStorage.getItem('discord_servers')).find(s => s.inviteCode === 'demo123') : null;
            
            if (demoServer) {
                const generalChannel = localStorage.getItem('discord_channels') ?
                    JSON.parse(localStorage.getItem('discord_channels')).find(c => c.serverId === demoServer.id && c.name === 'general') : null;
                
                if (generalChannel) {
                    const welcomeMessages = [
                        {
                            id: generateId(),
                            channelId: generalChannel.id,
                            userId: 'system',
                            content: 'Welcome to the Discord Clone! This is a demo server to showcase the functionality.',
                            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                            type: 'text'
                        },
                        {
                            id: generateId(),
                            channelId: generalChannel.id,
                            userId: 'system',
                            content: 'You can create your own servers, join existing ones with invite codes, and send messages.',
                            timestamp: new Date(Date.now() - 86390000).toISOString(), 
                            type: 'text'
                        },
                        {
                            id: generateId(),
                            channelId: generalChannel.id,
                            userId: 'system',
                            content: 'Try clicking the + button to create a new server or the compass icon to join an existing one!',
                            timestamp: new Date(Date.now() - 86380000).toISOString(),
                            type: 'text'
                        }
                    ];
                    
                    messagesDB.push(...welcomeMessages);
                    saveMessagesToStorage();
                }
            }
        }, 500);
    });
}

// Elements
const chatMessagesContainer = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const onlineMembersContainer = document.getElementById('online-members');
const offlineMembersContainer = document.getElementById('offline-members');
const onlineCountEl = document.getElementById('online-count');
const offlineCountEl = document.getElementById('offline-count');

// Current state
let currentMessages = [];

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Send message on Enter (but allow Shift+Enter for new lines)
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Send message when clicking the upload button (temporary for demo)
    document.querySelector('.upload-button').addEventListener('click', () => {
        sendMessage();
    });
});

// Send a message
function sendMessage() {
    if (!window.auth || !window.auth.isLoggedIn()) {
        alert('Please log in to send messages');
        return;
    }
    
    const content = messageInput.value.trim();
    if (!content) return;
    
    const currentUser = window.auth.getCurrentUser();
    
    // Determine where to send the message (channel or DM)
    let channelId;
    let isDM = false;
    
    // Check if we're in a direct message conversation
    const dmContainer = document.querySelector('.direct-message.active');
    if (dmContainer && dmContainer.dataset.userId) {
        channelId = `dm_${currentUser.id}_${dmContainer.dataset.userId}`;
        isDM = true;
    } else {
        // Otherwise use the current channel from the server
        channelId = window.servers ? window.servers.getCurrentChannelId() : null;
    }
    
    if (!channelId) {
        alert('Please select a channel or direct message to send messages in.');
        return;
    }
    
    // Create message object
    const message = {
        id: generateId(),
        channelId,
        userId: currentUser.id,
        content,
        timestamp: new Date().toISOString(),
        type: 'text'
    };
    
    // Add to database
    messagesDB.push(message);
    saveMessagesToStorage();
    
    // Clear input
    messageInput.value = '';
    
    // If it's a DM, try to send through websocket
    if (isDM && window.socket) {
        const recipientId = dmContainer.dataset.userId;
        window.socket.sendPrivateMessage(recipientId, content);
    }
    
    // Reload messages
    if (isDM) {
        loadDirectMessages(dmContainer.dataset.userId);
    } else {
        loadChannelMessages(channelId);
    }
    
    // Scroll to bottom of the chat
    scrollToBottom();
}

// Function to scroll to the bottom of the chat
function scrollToBottom() {
    if (chatMessagesContainer) {
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
}

// Load messages for a channel
function loadChannelMessages(channelId) {
    if (!channelId) return;
    
    // Get messages for this channel
    currentMessages = messagesDB.filter(msg => msg.channelId === channelId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    renderMessages();
    scrollToBottom();
    
    // Also load members for the current server
    loadServerMembers();
}

// Load direct messages between the current user and another user
function loadDirectMessages(userId) {
    if (!userId || !window.auth || !window.auth.isLoggedIn()) return;
    
    const currentUser = window.auth.getCurrentUser();
    
    // Create DM channel IDs (both possible combinations)
    const dmChannelId1 = `dm_${currentUser.id}_${userId}`;
    const dmChannelId2 = `dm_${userId}_${currentUser.id}`;
    
    // Get messages for both possible channel IDs
    currentMessages = messagesDB.filter(msg => 
        msg.channelId === dmChannelId1 || msg.channelId === dmChannelId2
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    renderMessages();
    scrollToBottom();
    
    // Update UI to show we're in a DM
    const targetUser = window.auth.getUserById(userId);
    if (targetUser) {
        // Update channel header
        document.getElementById('current-channel').textContent = targetUser.username;
        
        // Replace hashtag icon with user icon
        const channelIcon = document.querySelector('.chat-header-left i');
        channelIcon.className = 'fas fa-user';
        
        // Show chat interface (in case we were in friends view)
        hideFriendsUI();
        
        // Update message input placeholder
        messageInput.placeholder = `Message @${targetUser.username}`;
    }
}

// Render messages in the chat container
function renderMessages() {
    // Clear the container
    chatMessagesContainer.innerHTML = '';
    
    // Group messages by user and time
    const groupedMessages = groupMessages(currentMessages);
    
    // Render each group
    groupedMessages.forEach((group, index) => {
        const firstMessage = group[0];
        
        // Create message container
        const messageEl = document.createElement('div');
        messageEl.className = 'message';
        
        // Add avatar for first message in group
        const avatarEl = document.createElement('div');
        avatarEl.className = 'message-avatar';
        
        if (firstMessage.userId === 'system') {
            avatarEl.innerHTML = `<img src="assets/discord-logo.png" alt="System">`;
        } else {
            const user = window.auth.getUserById(firstMessage.userId);
            if (user) {
                avatarEl.innerHTML = `<img src="${user.avatar}" alt="${user.username}">`;
            } else {
                avatarEl.innerHTML = `<img src="assets/default-avatar.png" alt="Unknown User">`;
            }
        }
        
        messageEl.appendChild(avatarEl);
        
        // Create message content container
        const contentEl = document.createElement('div');
        contentEl.className = 'message-content';
        
        // Add header for first message in group
        const headerEl = document.createElement('div');
        headerEl.className = 'message-header';
        
        if (firstMessage.userId === 'system') {
            headerEl.innerHTML = `
                <span class="message-author">Discord Bot</span>
                <span class="message-timestamp">${formatDate(firstMessage.timestamp)}</span>
            `;
        } else {
            const user = window.auth.getUserById(firstMessage.userId);
            if (user) {
                headerEl.innerHTML = `
                    <span class="message-author">${user.username}</span>
                    <span class="message-timestamp">${formatDate(firstMessage.timestamp)}</span>
                `;
            } else {
                headerEl.innerHTML = `
                    <span class="message-author">Unknown User</span>
                    <span class="message-timestamp">${formatDate(firstMessage.timestamp)}</span>
                `;
            }
        }
        
        contentEl.appendChild(headerEl);
        
        // Add each message in the group
        group.forEach(message => {
            const textEl = document.createElement('div');
            textEl.className = 'message-text';
            textEl.textContent = message.content;
            contentEl.appendChild(textEl);
        });
        
        messageEl.appendChild(contentEl);
        chatMessagesContainer.appendChild(messageEl);
    });
    
    // Scroll to bottom
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

// Group messages by user and time (within 5 minutes)
function groupMessages(messages) {
    const groups = [];
    let currentGroup = [];
    
    messages.forEach((message, index) => {
        if (index === 0) {
            // First message starts a new group
            currentGroup.push(message);
        } else {
            const prevMessage = messages[index - 1];
            
            // Check if this message should be grouped with previous
            const sameUser = message.userId === prevMessage.userId;
            const timeClose = Math.abs(new Date(message.timestamp) - new Date(prevMessage.timestamp)) < 300000; // 5 minutes
            
            if (sameUser && timeClose) {
                // Add to current group
                currentGroup.push(message);
            } else {
                // Start a new group
                if (currentGroup.length > 0) {
                    groups.push([...currentGroup]);
                }
                currentGroup = [message];
            }
        }
    });
    
    // Add the last group if it exists
    if (currentGroup.length > 0) {
        groups.push(currentGroup);
    }
    
    return groups;
}

// Load and render members for the current server
function loadServerMembers() {
    if (!window.servers || !window.auth) return;
    
    const serverId = window.servers.getCurrentServerId();
    if (!serverId) return;
    
    // Get members for this server
    const userServers = localStorage.getItem('discord_user_servers') ? 
        JSON.parse(localStorage.getItem('discord_user_servers')) : [];
    
    const memberIds = userServers
        .filter(us => us.serverId === serverId)
        .map(us => us.userId);
    
    // Get user objects for these members
    const users = localStorage.getItem('discord_users') ?
        JSON.parse(localStorage.getItem('discord_users')) : [];
    
    const members = users.filter(user => memberIds.includes(user.id));
    
    // Add current user if they're not in the list
    const currentUser = window.auth.getCurrentUser();
    if (currentUser && !members.some(m => m.id === currentUser.id)) {
        members.push(currentUser);
    }
    
    // Simulate some online/offline status
    const onlineMembers = [];
    const offlineMembers = [];
    
    members.forEach(member => {
        // Make the current user and system always online
        if (member.id === currentUser?.id || member.id === 'system') {
            member.status = 'online';
            onlineMembers.push(member);
        } else {
            // Randomly assign online/offline
            if (Math.random() > 0.5) {
                member.status = 'online';
                onlineMembers.push(member);
            } else {
                member.status = 'offline';
                offlineMembers.push(member);
            }
        }
    });
    
    // Render members
    renderMembers(onlineMembers, offlineMembers);
}

// Render members in the sidebar
function renderMembers(onlineMembers, offlineMembers) {
    // Update counters
    onlineCountEl.textContent = onlineMembers.length;
    offlineCountEl.textContent = offlineMembers.length;
    
    // Clear containers
    onlineMembersContainer.innerHTML = '';
    offlineMembersContainer.innerHTML = '';
    
    // Render online members
    onlineMembers.forEach(member => {
        const memberEl = document.createElement('div');
        memberEl.className = 'member';
        
        memberEl.innerHTML = `
            <div class="member-avatar">
                <img src="${member.avatar || 'assets/default-avatar.png'}" alt="${member.username}">
                <div class="status-indicator status-${member.status}"></div>
            </div>
            <div class="member-info">
                <div class="member-name">${member.username}</div>
                <div class="member-status">Online</div>
            </div>
        `;
        
        onlineMembersContainer.appendChild(memberEl);
    });
    
    // Render offline members
    offlineMembers.forEach(member => {
        const memberEl = document.createElement('div');
        memberEl.className = 'member';
        
        memberEl.innerHTML = `
            <div class="member-avatar">
                <img src="${member.avatar || 'assets/default-avatar.png'}" alt="${member.username}">
                <div class="status-indicator status-offline"></div>
            </div>
            <div class="member-info">
                <div class="member-name">${member.username}</div>
                <div class="member-status">Offline</div>
            </div>
        `;
        
        offlineMembersContainer.appendChild(memberEl);
    });
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        // Today, show time
        return `Today at ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
        // Yesterday
        return `Yesterday at ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        // Show date
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

// Generate a unique ID
function generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// Save messages to localStorage
function saveMessagesToStorage() {
    localStorage.setItem('discord_messages', JSON.stringify(messagesDB));
}

// Save members to localStorage
function saveMembersToStorage() {
    localStorage.setItem('discord_members', JSON.stringify(membersDB));
}

// Expose necessary functions to other modules
window.chat = {
    loadChannelMessages,
    sendMessage
}; 