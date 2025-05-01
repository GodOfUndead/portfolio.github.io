/**
 * Servers Module
 * Handles server creation, joining, and management
 */

// Mock database for demo purposes
let serversDB = [];
let channelsDB = [];
let userServersDB = []; // Tracks which users belong to which servers

// Load data from localStorage
if (localStorage.getItem('discord_servers')) {
    try {
        serversDB = JSON.parse(localStorage.getItem('discord_servers'));
    } catch (e) {
        console.error('Error loading servers from localStorage', e);
    }
}

if (localStorage.getItem('discord_channels')) {
    try {
        channelsDB = JSON.parse(localStorage.getItem('discord_channels'));
    } catch (e) {
        console.error('Error loading channels from localStorage', e);
    }
}

if (localStorage.getItem('discord_user_servers')) {
    try {
        userServersDB = JSON.parse(localStorage.getItem('discord_user_servers'));
    } catch (e) {
        console.error('Error loading user servers from localStorage', e);
    }
}

// Create Demo Data if none exists
if (serversDB.length === 0) {
    // Create a demo server
    const demoServer = {
        id: generateId(),
        name: 'Demo Server',
        icon: 'assets/default-server.png',
        ownerId: null, // Will be set to current user
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        inviteCode: 'demo123'
    };
    
    serversDB.push(demoServer);
    
    // Create default channels for the demo server
    const channels = [
        {
            id: generateId(),
            serverId: demoServer.id,
            name: 'general',
            type: 'text',
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            serverId: demoServer.id,
            name: 'welcome',
            type: 'text',
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            serverId: demoServer.id,
            name: 'General',
            type: 'voice',
            createdAt: new Date().toISOString()
        }
    ];
    
    channelsDB.push(...channels);
    
    // Save to localStorage
    saveServersToStorage();
    saveChannelsToStorage();
}

// Elements
const serverModal = document.getElementById('add-server-modal');
const joinServerModal = document.getElementById('join-server-modal');
const createServerForm = document.getElementById('add-server-modal');
const joinServerForm = document.getElementById('join-server-modal');
const addServerBtn = document.getElementById('add-server-btn');
const userServersContainer = document.getElementById('user-servers');
const textChannelsContainer = document.getElementById('text-channels');
const voiceChannelsContainer = document.getElementById('voice-channels');
const currentServerNameEl = document.getElementById('current-server-name');

// Current state
let currentServerId = null;
let currentChannelId = null;

// Add event listeners for server related actions
document.addEventListener('DOMContentLoaded', () => {
    // Show server creation modal
    addServerBtn.addEventListener('click', () => {
        serverModal.classList.add('active');
    });
    
    // Cancel server creation
    document.getElementById('cancel-server').addEventListener('click', () => {
        serverModal.classList.remove('active');
    });
    
    // Cancel server join
    document.getElementById('cancel-join').addEventListener('click', () => {
        joinServerModal.classList.remove('active');
    });
    
    // Toggle between create and join server modals
    // For now just open join server modal when clicked on compass icon
    document.querySelector('.server-discovery').addEventListener('click', () => {
        joinServerModal.classList.add('active');
    });
    
    // Server icon upload preview
    const serverIconUpload = document.getElementById('server-avatar-upload');
    const serverIconPreview = document.getElementById('server-avatar-preview');
    
    document.querySelector('.server-avatar-preview').addEventListener('click', () => {
        serverIconUpload.click();
    });
    
    serverIconUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                serverIconPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Add form submit event listeners
    document.getElementById('create-server').addEventListener('click', () => {
        // Get form data
        const serverName = document.getElementById('server-name').value;
        let serverIcon = serverIconPreview.src;
        
        if (!serverName) {
            alert('Please enter a server name');
            return;
        }
        
        // Create the server
        createServer(serverName, serverIcon);
        
        // Reset form and close modal
        document.getElementById('server-name').value = '';
        serverIconPreview.src = 'assets/default-server.png';
        serverModal.classList.remove('active');
    });
    
    // Handle server join button click
    document.getElementById('join-server').addEventListener('click', () => {
        // Get form data
        const inviteCode = document.getElementById('server-invite-code').value;
        
        if (!inviteCode) {
            alert('Please enter an invite code');
            return;
        }
        
        // Join the server
        joinServer(inviteCode);
        
        // Reset form and close modal
        document.getElementById('server-invite-code').value = '';
        joinServerModal.classList.remove('active');
    });
    
    // Handle home icon click
    document.querySelector('.home-icon').addEventListener('click', () => {
        setCurrentServer(null);
    });
});

// Load user's servers when they log in
function loadUserServers() {
    if (!window.auth || !window.auth.isLoggedIn()) return;
    
    const currentUser = window.auth.getCurrentUser();
    
    // Update demo server owner if needed
    const demoServer = serversDB.find(s => s.inviteCode === 'demo123');
    if (demoServer && !demoServer.ownerId) {
        demoServer.ownerId = currentUser.id;
        saveServersToStorage();
    }
    
    // Add user to demo server if not already
    let userServer = userServersDB.find(us => 
        us.userId === currentUser.id && us.serverId === demoServer.id);
    
    if (!userServer) {
        userServer = {
            id: generateId(),
            userId: currentUser.id,
            serverId: demoServer.id,
            joinedAt: new Date().toISOString()
        };
        userServersDB.push(userServer);
        saveUserServersToStorage();
    }
    
    // Render user's servers
    renderUserServers();
    
    // Set demo server as active by default
    setCurrentServer(demoServer.id);
}

// Render the user's servers in the sidebar
function renderUserServers() {
    userServersContainer.innerHTML = '';
    
    const currentUser = window.auth.getCurrentUser();
    if (!currentUser) return;
    
    // Get servers this user is a member of
    const userServerIds = userServersDB
        .filter(us => us.userId === currentUser.id)
        .map(us => us.serverId);
    
    const userServers = serversDB.filter(server => userServerIds.includes(server.id));
    
    // Create server icons
    userServers.forEach(server => {
        const serverIcon = document.createElement('div');
        serverIcon.className = 'server-icon';
        serverIcon.dataset.serverId = server.id;
        
        if (server.id === currentServerId) {
            serverIcon.classList.add('active');
        }
        
        if (server.icon.startsWith('data:')) {
            // For uploaded base64 images
            const img = document.createElement('img');
            img.src = server.icon;
            img.className = 'server-image';
            img.alt = server.name;
            serverIcon.appendChild(img);
        } else {
            // For text-based server icons or default icons
            if (server.icon === 'assets/default-server.png') {
                // Use the first letter of the server name
                serverIcon.textContent = server.name.charAt(0).toUpperCase();
            } else {
                const img = document.createElement('img');
                img.src = server.icon;
                img.className = 'server-image';
                img.alt = server.name;
                serverIcon.appendChild(img);
            }
        }
        
        // Add click event to switch servers
        serverIcon.addEventListener('click', () => {
            setCurrentServer(server.id);
        });
        
        userServersContainer.appendChild(serverIcon);
    });
}

// Set the current active server
function setCurrentServer(serverId) {
    currentServerId = serverId;
    
    // Hide friends UI if it's visible
    if (window.friends && typeof window.friends.hideFriendsUI === 'function') {
        window.friends.hideFriendsUI();
    }
    
    // Update active server indicator
    document.querySelectorAll('.server-icon').forEach(icon => {
        icon.classList.remove('active');
    });
    
    if (serverId) {
        document.querySelector(`.server-icon[data-server-id="${serverId}"]`)?.classList.add('active');
        
        // Load server details
        const server = serversDB.find(s => s.id === serverId);
        currentServerNameEl.textContent = server.name;
        
        // Load server channels
        loadServerChannels(serverId);
        
        // Set first text channel as active if none is selected
        const firstTextChannel = channelsDB.find(c => c.serverId === serverId && c.type === 'text');
        if (firstTextChannel && !currentChannelId) {
            setCurrentChannel(firstTextChannel.id);
        }
    } else {
        // Show Home/Direct Messages view
        document.querySelector('.home-icon').classList.add('active');
        currentServerNameEl.textContent = 'Home';
        textChannelsContainer.innerHTML = '';
        voiceChannelsContainer.innerHTML = '';
        currentChannelId = null;
        
        // Update channel header
        document.getElementById('current-channel').textContent = '';
    }
    
    // Trigger chat reload for the current channel
    if (window.chat && currentChannelId) {
        window.chat.loadChannelMessages(currentChannelId);
    }
    
    // Dispatch event for server change
    document.dispatchEvent(new CustomEvent('server-changed', { detail: { serverId } }));
}

// Load and render the channels for a server
function loadServerChannels(serverId) {
    // Get the channels for this server
    const serverChannels = channelsDB.filter(channel => channel.serverId === serverId);
    
    // Separate text and voice channels
    const textChannels = serverChannels.filter(channel => channel.type === 'text');
    const voiceChannels = serverChannels.filter(channel => channel.type === 'voice');
    
    // Render text channels
    textChannelsContainer.innerHTML = '';
    textChannels.forEach(channel => {
        const channelEl = document.createElement('div');
        channelEl.className = 'channel';
        channelEl.dataset.channelId = channel.id;
        
        if (channel.id === currentChannelId) {
            channelEl.classList.add('active');
        }
        
        channelEl.innerHTML = `
            <i class="fas fa-hashtag"></i>
            <span>${channel.name}</span>
        `;
        
        channelEl.addEventListener('click', () => {
            setCurrentChannel(channel.id);
        });
        
        textChannelsContainer.appendChild(channelEl);
    });
    
    // Render voice channels
    voiceChannelsContainer.innerHTML = '';
    voiceChannels.forEach(channel => {
        const channelEl = document.createElement('div');
        channelEl.className = 'channel';
        channelEl.dataset.channelId = channel.id;
        
        channelEl.innerHTML = `
            <i class="fas fa-volume-up"></i>
            <span>${channel.name}</span>
        `;
        
        channelEl.addEventListener('click', () => {
            // For demo purposes, just show an alert when clicking on voice channels
            alert(`Joining voice channel: ${channel.name}`);
        });
        
        voiceChannelsContainer.appendChild(channelEl);
    });
}

// Set the current active channel
function setCurrentChannel(channelId) {
    currentChannelId = channelId;
    
    // Hide friends UI if it's visible
    if (window.friends && typeof window.friends.hideFriendsUI === 'function') {
        window.friends.hideFriendsUI();
    }
    
    // Update active channel indicator
    document.querySelectorAll('.channel').forEach(channel => {
        channel.classList.remove('active');
    });
    
    const channelEl = document.querySelector(`.channel[data-channel-id="${channelId}"]`);
    if (channelEl) {
        channelEl.classList.add('active');
        
        // Get channel details
        const channel = channelsDB.find(c => c.id === channelId);
        
        // Update channel header
        document.getElementById('current-channel').textContent = channel.name;
        
        // Update message input placeholder
        document.getElementById('message-input').placeholder = `Message #${channel.name}`;
        
        // Load messages for this channel
        if (window.chat) {
            window.chat.loadChannelMessages(channelId);
        }
        
        // Show chat messages container and input
        const chatMessages = document.getElementById('chat-messages');
        const messageInputContainer = document.querySelector('.message-input-container');
        
        if (chatMessages) chatMessages.style.display = 'flex';
        if (messageInputContainer) messageInputContainer.style.display = 'block';
    }
    
    // Dispatch event for channel change
    document.dispatchEvent(new CustomEvent('channel-changed', { detail: { channelId } }));
}

// Create a new server
function createServer(name, icon) {
    if (!window.auth || !window.auth.isLoggedIn()) {
        alert('You need to be logged in to create a server');
        return;
    }
    
    const currentUser = window.auth.getCurrentUser();
    
    // Create server object
    const server = {
        id: generateId(),
        name: name.trim(),
        icon: icon || 'assets/default-server.png',
        ownerId: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        inviteCode: generateInviteCode()
    };
    
    // Add to servers database
    serversDB.push(server);
    
    // Create default channels
    const generalTextChannel = {
        id: generateId(),
        serverId: server.id,
        name: 'general',
        type: 'text',
        createdAt: new Date().toISOString()
    };
    
    const welcomeTextChannel = {
        id: generateId(),
        serverId: server.id,
        name: 'welcome',
        type: 'text',
        createdAt: new Date().toISOString()
    };
    
    const generalVoiceChannel = {
        id: generateId(),
        serverId: server.id,
        name: 'General',
        type: 'voice',
        createdAt: new Date().toISOString()
    };
    
    // Add channels to database
    channelsDB.push(generalTextChannel, welcomeTextChannel, generalVoiceChannel);
    
    // Add user to server
    const userServer = {
        userId: currentUser.id,
        serverId: server.id,
        role: 'owner',
        joinedAt: new Date().toISOString()
    };
    
    userServersDB.push(userServer);
    
    // Save to localStorage
    saveServersToStorage();
    saveChannelsToStorage();
    saveUserServersToStorage();
    
    // Add welcome message
    if (window.messagesDB !== undefined) {
        const welcomeMessages = [
            {
                id: generateId(),
                channelId: welcomeTextChannel.id,
                userId: 'system',
                content: `Welcome to ${name}! This server was created by ${currentUser.username}.`,
                timestamp: new Date().toISOString(),
                type: 'text'
            },
            {
                id: generateId(),
                channelId: welcomeTextChannel.id,
                userId: 'system',
                content: `Invite your friends with the invite code: ${server.inviteCode}`,
                timestamp: new Date(Date.now() + 1000).toISOString(),
                type: 'text'
            }
        ];
        
        window.messagesDB.push(...welcomeMessages);
        localStorage.setItem('discord_messages', JSON.stringify(window.messagesDB));
    }
    
    // Render the servers list
    renderUserServers();
    
    // Switch to the new server
    setCurrentServer(server.id);
    
    // Show toast notification with invite code
    alert(`Server created! Invite code: ${server.inviteCode}`);
    
    return server;
}

// Join an existing server
function joinServer(inviteCode) {
    if (!window.auth || !window.auth.isLoggedIn()) {
        alert('You need to be logged in to join a server');
        return;
    }
    
    const currentUser = window.auth.getCurrentUser();
    
    // Find server by invite code
    const server = serversDB.find(s => s.inviteCode === inviteCode);
    
    if (!server) {
        alert('Invalid invite code');
        return;
    }
    
    // Check if user is already in the server
    const existingMembership = userServersDB.find(us => 
        us.userId === currentUser.id && us.serverId === server.id
    );
    
    if (existingMembership) {
        alert('You are already a member of this server');
        setCurrentServer(server.id);
        return;
    }
    
    // Add user to server
    const userServer = {
        userId: currentUser.id,
        serverId: server.id,
        role: 'member',
        joinedAt: new Date().toISOString()
    };
    
    userServersDB.push(userServer);
    
    // Save to localStorage
    saveUserServersToStorage();
    
    // Add join message to general channel
    const generalChannel = channelsDB.find(c => c.serverId === server.id && c.name === 'general');
    
    if (generalChannel && window.messagesDB !== undefined) {
        const joinMessage = {
            id: generateId(),
            channelId: generalChannel.id,
            userId: 'system',
            content: `${currentUser.username} joined the server`,
            timestamp: new Date().toISOString(),
            type: 'text'
        };
        
        window.messagesDB.push(joinMessage);
        localStorage.setItem('discord_messages', JSON.stringify(window.messagesDB));
    }
    
    // Render the servers list
    renderUserServers();
    
    // Switch to the server
    setCurrentServer(server.id);
    
    return server;
}

// Generate a unique ID
function generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// Generate a server invite code
function generateInviteCode() {
    return Math.random().toString(36).substring(2, 10);
}

// Save data to localStorage
function saveServersToStorage() {
    localStorage.setItem('discord_servers', JSON.stringify(serversDB));
}

function saveChannelsToStorage() {
    localStorage.setItem('discord_channels', JSON.stringify(channelsDB));
}

function saveUserServersToStorage() {
    localStorage.setItem('discord_user_servers', JSON.stringify(userServersDB));
}

// Expose necessary functions to other modules
window.servers = {
    getCurrentServerId: () => currentServerId,
    getCurrentChannelId: () => currentChannelId,
    getServerById: (id) => serversDB.find(s => s.id === id),
    getChannelById: (id) => channelsDB.find(c => c.id === id),
    createServer,
    joinServer,
    setCurrentServer,
    setCurrentChannel
}; 