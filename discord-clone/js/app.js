/**
 * Discord Clone
 * Main JavaScript file for adding interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in, redirect to login if not
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Get logged in user
    const currentUser = JSON.parse(localStorage.getItem('discord_user'));
    
    // Initialize state
    let isMuted = false;
    let isDeafened = false;
    let membersSidebarVisible = true;
    let userStatus = 'online';
    let selectedTemplate = 'Create My Own';
    let serverAvatarFile = null;
    let activeVoiceChannel = null;
    let voiceConnected = false;
    let currentServer = 'coding';
    let currentChannel = 'general';
    
    // Initialize server messages
    const serverMessages = {
        'home': [],
        'gaming': [
            {
                author: 'GamingBot',
                authorClass: 'bot',
                avatar: 'assets/icons/bot-avatar.svg',
                time: 'Today at 10:15 AM',
                text: 'Welcome to the Gaming server! Share your favorite games and find teammates.',
                attachment: null
            },
            {
                author: 'ProGamer',
                authorClass: '',
                avatar: 'assets/icons/user1-avatar.svg',
                time: 'Today at 10:30 AM',
                text: 'Anyone playing the new Call of Duty?',
                attachment: null
            }
        ],
        'music': [
            {
                author: 'MusicBot',
                authorClass: 'bot',
                avatar: 'assets/icons/bot-avatar.svg',
                time: 'Today at 9:15 AM',
                text: 'Welcome to the Music server! Share your favorite tracks and discover new artists.',
                attachment: null
            },
            {
                author: 'MelodyMaker',
                authorClass: '',
                avatar: 'assets/icons/user1-avatar.svg',
                time: 'Today at 9:30 AM',
                text: 'Just released a new track! Check it out: https://soundcloud.com/example',
                attachment: null
            }
        ],
        'coding': [
            {
                author: 'DiscordBot',
                authorClass: 'bot',
                avatar: 'assets/icons/bot-avatar.svg',
                time: 'Today at 12:00 PM',
                text: 'Welcome to the Coding server! Feel free to share your projects and get feedback from the community.',
                attachment: null
            },
            {
                author: 'JaneDoe',
                authorClass: '',
                avatar: 'assets/icons/user1-avatar.svg',
                time: 'Today at 12:30 PM',
                text: 'Thanks! I just finished my new portfolio website built with HTML, CSS, and JavaScript.',
                attachment: null
            }
        ],
        'portfolio': [
            {
                author: 'PortfolioBot',
                authorClass: 'bot',
                avatar: 'assets/icons/bot-avatar.svg',
                time: 'Today at 11:15 AM',
                text: 'Welcome to the Portfolio server! Share your work and get constructive feedback.',
                attachment: null
            },
            {
                author: 'DesignWizard',
                authorClass: '',
                avatar: 'assets/icons/user1-avatar.svg',
                time: 'Today at 11:30 AM',
                text: 'Just updated my UX portfolio with some new case studies.',
                attachment: null
            }
        ]
    };
    
    // Load saved messages from localStorage
    const savedMessages = localStorage.getItem('discord_messages');
    if (savedMessages) {
        Object.assign(serverMessages, JSON.parse(savedMessages));
    }
    
    // Initialize UI
    initializeUI();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Load initial data
    loadInitialData();
    
    function initializeUI() {
        // Update user information
        updateUserInfo();
        
        // Load messages for current server
        loadServerMessages(currentServer);
        
        // Initialize theme
        initializeTheme();
        
        // Update timestamps
        updateTimestamps();
        
        // Add Discord logo
        addDiscordLogo();
        
        // Initialize server creation modal
        initializeServerCreationModal();
    }
    
    function initializeEventListeners() {
        // Server selection
        document.querySelectorAll('.server-icon').forEach(serverIcon => {
            serverIcon.addEventListener('click', handleServerClick);
        });
        
        // Channel selection
        document.querySelectorAll('.channel').forEach(channel => {
            channel.addEventListener('click', handleChannelClick);
        });
        
        // Message input
        const messageInput = document.querySelector('.message-input');
        if (messageInput) {
            messageInput.addEventListener('keypress', handleMessageInput);
        }
        
        // Settings icon
        const settingsIcon = document.querySelector('.fa-cog');
        if (settingsIcon) {
            settingsIcon.addEventListener('click', () => {
                document.querySelector('.user-settings-modal').classList.add('active');
                initializeSettings();
            });
        }
        
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('active');
                });
            });
        });
        
        // Member list toggle
        const memberListToggle = document.querySelector('.fa-user-friends');
        if (memberListToggle) {
            memberListToggle.addEventListener('click', () => {
                const membersSidebar = document.querySelector('.members-sidebar');
                membersSidebar.classList.toggle('hidden');
                membersSidebarVisible = !membersSidebarVisible;
            });
        }
        
        // Voice controls
        const microphoneIcon = document.querySelector('.fa-microphone');
        const headphonesIcon = document.querySelector('.fa-headphones');
        
        if (microphoneIcon) {
            microphoneIcon.addEventListener('click', () => {
                isMuted = !isMuted;
                microphoneIcon.classList.toggle('active', isMuted);
                showNotification(isMuted ? 'Microphone muted' : 'Microphone unmuted');
            });
        }
        
        if (headphonesIcon) {
            headphonesIcon.addEventListener('click', () => {
                isDeafened = !isDeafened;
                headphonesIcon.classList.toggle('active', isDeafened);
                showNotification(isDeafened ? 'Deafened' : 'Undeafened');
            });
        }
        
        // Add server button
        const addServerIcon = document.querySelector('.add-server');
        if (addServerIcon) {
            addServerIcon.addEventListener('click', () => {
                document.querySelector('.server-creation-modal').classList.add('active');
            });
        }
        
        // Server template selection
        document.querySelectorAll('.server-template').forEach(template => {
            template.addEventListener('click', () => {
                document.querySelectorAll('.server-template').forEach(t => t.classList.remove('selected'));
                template.classList.add('selected');
                selectedTemplate = template.querySelector('.template-name').textContent;
            });
        });
        
        // Avatar upload
        const avatarUploadBtn = document.querySelector('.avatar-upload-btn');
        if (avatarUploadBtn) {
            avatarUploadBtn.addEventListener('click', () => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.style.display = 'none';
                document.body.appendChild(fileInput);
                
                fileInput.click();
                
                fileInput.addEventListener('change', () => {
                    if (fileInput.files && fileInput.files[0]) {
                        const file = fileInput.files[0];
                        const reader = new FileReader();
                        
                        reader.onload = (e) => {
                            const avatarPreview = document.querySelector('.avatar-preview');
                            let img = avatarPreview.querySelector('img');
                            if (!img) {
                                img = document.createElement('img');
                                avatarPreview.innerHTML = '';
                                avatarPreview.appendChild(img);
                            }
                            img.src = e.target.result;
                            serverAvatarFile = file;
                        };
                        
                        reader.readAsDataURL(file);
                    }
                });
            });
        }
        
        // Create server button
        const createServerBtn = document.querySelector('.create-server-button');
        if (createServerBtn) {
            createServerBtn.addEventListener('click', () => {
                const serverNameInput = document.querySelector('.server-creation-modal .form-input');
                const serverName = serverNameInput.value.trim();
                
                if (serverName) {
                    addNewServer(serverName, serverAvatarFile);
                    document.querySelector('.server-creation-modal').classList.remove('active');
                    serverNameInput.value = '';
                    const avatarPreview = document.querySelector('.avatar-preview');
                    avatarPreview.innerHTML = '<span>A</span>';
                    serverAvatarFile = null;
                } else {
                    showNotification('Please enter a server name', 'error');
                }
            });
        }
        
        // Back button
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                document.querySelector('.server-creation-modal').classList.remove('active');
                const serverNameInput = document.querySelector('.server-creation-modal .form-input');
                serverNameInput.value = '';
                const avatarPreview = document.querySelector('.avatar-preview');
                avatarPreview.innerHTML = '<span>A</span>';
                serverAvatarFile = null;
            });
        }
        
        // Status modal
        const statusIcon = document.querySelector('.status-indicator');
        if (statusIcon) {
            statusIcon.addEventListener('click', () => {
                document.querySelector('.status-modal').classList.add('active');
            });
        }
        
        // Status options
        document.querySelectorAll('.status-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.status-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                userStatus = option.querySelector('span').textContent.toLowerCase();
                
                // Update status indicator
                const statusIndicator = document.querySelector('.status-indicator');
                statusIndicator.className = 'status-indicator ' + userStatus;
                
                // Update user status in UI
                const userStatusElement = document.querySelector('.status');
                if (userStatusElement) {
                    userStatusElement.textContent = userStatus.charAt(0).toUpperCase() + userStatus.slice(1);
                }
            });
        });
        
        // Save status button
        const saveStatusBtn = document.querySelector('.save-status-button');
        if (saveStatusBtn) {
            saveStatusBtn.addEventListener('click', () => {
                const customStatusInput = document.querySelector('.custom-status input');
                const customStatus = customStatusInput.value.trim();
                
                // Save status to localStorage
                const userSettings = JSON.parse(localStorage.getItem('discord_user_settings') || '{}');
                userSettings.status = userStatus;
                userSettings.customStatus = customStatus;
                localStorage.setItem('discord_user_settings', JSON.stringify(userSettings));
                
                // Close modal
                document.querySelector('.status-modal').classList.remove('active');
                
                // Show notification
                showNotification('Status updated successfully');
            });
        }
        
        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
        
        // User profile click
        const userAvatar = document.querySelector('.user-avatar');
        const userNameDisplay = document.querySelector('.username');
        
        if (userAvatar) {
            userAvatar.addEventListener('click', openUserProfileModal);
        }
        
        if (userNameDisplay) {
            userNameDisplay.addEventListener('click', openUserProfileModal);
        }
        
        // Logout button
        const logoutButton = document.querySelector('.sidebar-item.logout');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to log out?')) {
                    localStorage.removeItem('discord_user');
                    window.location.href = 'login.html';
                }
            });
        }
        
        // Theme toggle
        const themeToggle = document.querySelector('.sidebar-item[data-theme="appearance"]');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                toggleTheme();
                document.querySelector('.user-settings-modal').classList.remove('active');
            });
        }
        
        // Search functionality
        const searchInput = document.querySelector('.search-container input');
        const searchIcon = document.querySelector('.search-container .fa-search');
        
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    searchMessages(searchInput.value);
                }
            });
        }
        
        if (searchIcon) {
            searchIcon.addEventListener('click', () => {
                searchMessages(searchInput.value);
            });
        }
        
        // File upload
        const fileUploadButton = document.querySelector('.fa-file-image');
        if (fileUploadButton) {
            fileUploadButton.addEventListener('click', () => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.style.display = 'none';
                document.body.appendChild(fileInput);
                
                fileInput.click();
                
                fileInput.addEventListener('change', () => {
                    if (fileInput.files && fileInput.files[0]) {
                        const file = fileInput.files[0];
                        const reader = new FileReader();
                        
                        reader.onload = (e) => {
                            sendMessage('', e.target.result);
                        };
                        
                        reader.readAsDataURL(file);
                    }
                    document.body.removeChild(fileInput);
                });
            });
        }
        
        // Emoji picker
        const emojiButton = document.querySelector('.fa-smile');
        if (emojiButton) {
            emojiButton.addEventListener('click', () => {
                const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '👍', '🎮', '🎯', '💻', '🎸', '🎵'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                messageInput.value += randomEmoji;
                messageInput.focus();
            });
        }
    }
    
    function initializeServerCreationModal() {
        const modal = document.querySelector('.server-creation-modal');
        const createButton = modal.querySelector('.create-server-button');
        const backButton = modal.querySelector('.back-button');
        const serverNameInput = modal.querySelector('.form-input');
        const avatarUploadBtn = modal.querySelector('.avatar-upload-btn');
        const avatarPreview = modal.querySelector('.avatar-preview');
        const templates = modal.querySelectorAll('.server-template');

        // Template selection
        templates.forEach(template => {
            template.addEventListener('click', () => {
                templates.forEach(t => t.classList.remove('selected'));
                template.classList.add('selected');
                selectedTemplate = template.querySelector('.template-name').textContent;
            });
        });

        // Avatar upload
        avatarUploadBtn.addEventListener('click', () => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
            
            fileInput.click();
            
            fileInput.addEventListener('change', () => {
                if (fileInput.files && fileInput.files[0]) {
                    const file = fileInput.files[0];
                    const reader = new FileReader();
                    
                    reader.onload = (e) => {
                        let img = avatarPreview.querySelector('img');
                        if (!img) {
                            img = document.createElement('img');
                            avatarPreview.innerHTML = '';
                            avatarPreview.appendChild(img);
                        }
                        img.src = e.target.result;
                        serverAvatarFile = file;
                    };
                    
                    reader.readAsDataURL(file);
                }
            });
        });

        // Create server
        createButton.addEventListener('click', () => {
            const serverName = serverNameInput.value.trim();
            if (serverName) {
                addNewServer(serverName, serverAvatarFile);
                modal.classList.remove('active');
                serverNameInput.value = '';
                avatarPreview.innerHTML = '<span>A</span>';
                serverAvatarFile = null;
            } else {
                showNotification('Please enter a server name', 'error');
            }
        });

        // Back button
        backButton.addEventListener('click', () => {
            modal.classList.remove('active');
            serverNameInput.value = '';
            avatarPreview.innerHTML = '<span>A</span>';
            serverAvatarFile = null;
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                serverNameInput.value = '';
                avatarPreview.innerHTML = '<span>A</span>';
                serverAvatarFile = null;
            }
        });
    }
    
    function loadInitialData() {
        // Load user settings
        loadUserSettings();
        
        // Preload images
        preloadImages();
    }
    
    // Update user information from login
    function updateUserInfo() {
        // Update username and avatar
        const userNameDisplay = document.querySelector('.username');
        const userTagDisplay = document.querySelector('.status');
        const userAvatar = document.querySelector('.user-avatar img');
        
        if (userNameDisplay && userTagDisplay && userAvatar) {
            userNameDisplay.textContent = currentUser.username;
            userTagDisplay.textContent = '#' + Math.floor(1000 + Math.random() * 9000); // Random tag
            
            // Update avatar if exists
            if (currentUser.avatar) {
                userAvatar.src = currentUser.avatar;
            }
            
            // Update profile avatar in settings modal
            const profileAvatar = document.querySelector('.profile-avatar img');
            if (profileAvatar) {
                profileAvatar.src = currentUser.avatar || 'assets/icons/user-avatar.svg';
            }
            
            // Update username in settings modal
            const usernameInSettings = document.querySelector('.username-tag .username');
            if (usernameInSettings) {
                usernameInSettings.textContent = currentUser.username;
            }
            
            // Update email in settings form
            const emailInput = document.querySelector('.form-section input[type="email"]');
            if (emailInput) {
                emailInput.value = currentUser.email;
            }
        }
    }
    
    // Check if user is logged in
    function isLoggedIn() {
        return localStorage.getItem('discord_user') !== null;
    }
    
    // Server selection
    function handleServerClick(event) {
        // Remove selected class from all server icons
        document.querySelectorAll('.server-icon').forEach(icon => icon.classList.remove('selected'));
        
        // Add selected class to clicked server icon
        event.currentTarget.classList.add('selected');
        
        // Get server name from tooltip
        let serverName = '';
        if (event.currentTarget.querySelector('.tooltip')) {
            serverName = event.currentTarget.querySelector('.tooltip').textContent.toLowerCase();
        }
        
        // Update current server and load its messages
        if (serverName === 'home') {
            currentServer = 'home';
            document.querySelector('.server-header h3').textContent = 'Home';
        } else if (serverName === 'gaming') {
            currentServer = 'gaming';
            document.querySelector('.server-header h3').textContent = 'Gaming';
        } else if (serverName === 'music') {
            currentServer = 'music';
            document.querySelector('.server-header h3').textContent = 'Music';
        } else if (serverName === 'coding') {
            currentServer = 'coding';
            document.querySelector('.server-header h3').textContent = 'Coding';
        } else if (serverName === 'portfolio') {
            currentServer = 'portfolio';
            document.querySelector('.server-header h3').textContent = 'Portfolio';
        }
        
        // Load server-specific messages
        loadServerMessages(currentServer);
        
        // Remove notification indicator if present
        const notification = event.currentTarget.querySelector('.server-notification');
        if (notification) {
            notification.remove();
        }
    }
    
    // Channel selection
    function handleChannelClick(event) {
        // Remove selected class from all channels
        document.querySelectorAll('.channel').forEach(ch => ch.classList.remove('selected'));
        
        // Add selected class to clicked channel
        event.currentTarget.classList.add('selected');
        
        // Update channel name in the header
        const channelName = event.currentTarget.querySelector('span').textContent;
        document.querySelector('.channel-name').textContent = channelName;
        
        // Update message input placeholder
        const messageInput = document.querySelector('.message-input');
        if (messageInput) {
            messageInput.placeholder = `Message #${channelName}`;
        }
        
        // Remove unread indicator if present
        const unreadIndicator = event.currentTarget.querySelector('.unread-indicator');
        if (unreadIndicator) {
            unreadIndicator.remove();
        }
    }
    
    // Message input
    function handleMessageInput(event) {
        if (event.key === 'Enter' && event.target.value.trim() !== '') {
            sendMessage(event.target.value);
            event.target.value = '';
        }
    }
    
    // Send message functionality
    function sendMessage(text, imageSrc = null) {
        // Ensure user is logged in
        if (!isLoggedIn()) {
            alert('You must be logged in to send messages.');
            window.location.href = 'login.html';
            return;
        }
        
        // Get the current timestamp
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = (hours % 12) || 12;
        const timestamp = `Today at ${formattedHours}:${minutes} ${ampm}`;
        
        // Create message object
        const newMessageObj = {
            author: currentUser.username,
            authorClass: 'you',
            avatar: currentUser.avatar || 'assets/icons/user-avatar.svg',
            time: timestamp,
            text: text ? formatMessageText(text) : '',
            attachment: imageSrc ? {
                thumbnail: imageSrc,
                title: '',
                description: ''
            } : null
        };
        
        // Add to server messages
        if (!serverMessages[currentServer]) {
            serverMessages[currentServer] = [];
        }
        serverMessages[currentServer].push(newMessageObj);
        
        // Create a new message element
        const newMessage = document.createElement('div');
        newMessage.className = 'message';
        
        // Generate message HTML
        let messageHTML = `
            <div class="message-avatar">
                <img src="${currentUser.avatar || 'assets/icons/user-avatar.svg'}" alt="User Avatar">
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author you">${currentUser.username}</span>
                    <span class="message-timestamp">${timestamp}</span>
                </div>
        `;
        
        if (text) {
            messageHTML += `
                <div class="message-text">
                    ${formatMessageText(text)}
                </div>
            `;
        }
        
        if (imageSrc) {
            messageHTML += `
                <div class="message-attachment">
                    <div class="attachment-thumbnail">
                        <img src="${imageSrc}" alt="Uploaded Image">
                    </div>
                </div>
            `;
        }
        
        messageHTML += `</div>`;
        
        newMessage.innerHTML = messageHTML;
        
        // Append the message to the container
        const messagesContainer = document.querySelector('.messages-container');
        messagesContainer.appendChild(newMessage);
        
        // Scroll to the new message
        newMessage.scrollIntoView({ behavior: 'smooth' });
        
        // Save messages to localStorage
        localStorage.setItem('discord_messages', JSON.stringify(serverMessages));
    }
    
    // Format message text (detect links, etc.)
    function formatMessageText(text) {
        // Convert URLs to clickable links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, url => `<a href="${url}" class="message-link" target="_blank">${url}</a>`);
    }
    
    // Add a new server to the sidebar
    function addNewServer(name, avatarFile = null) {
        const serversList = document.querySelector('.servers-list');
        const serverId = name.toLowerCase().replace(/\s+/g, '-');
        
        // Create server icon
        const serverIcon = document.createElement('div');
        serverIcon.className = 'server-icon';
        serverIcon.dataset.server = serverId;
        
        if (avatarFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                serverIcon.style.backgroundImage = `url(${e.target.result})`;
            };
            reader.readAsDataURL(avatarFile);
        } else {
            serverIcon.style.backgroundColor = getRandomColor();
            serverIcon.textContent = name.charAt(0).toUpperCase();
        }
        
        // Add to servers list
        serversList.insertBefore(serverIcon, document.querySelector('.add-server'));
        
        // Initialize server messages
        serverMessages[serverId] = [
            {
                author: 'DiscordBot',
                authorClass: 'bot',
                avatar: 'assets/icons/bot-avatar.svg',
                time: 'Just now',
                text: `Welcome to ${name}! This is the beginning of your server.`,
                attachment: null
            }
        ];
        
        // Save messages to localStorage
        localStorage.setItem('discord_messages', JSON.stringify(serverMessages));
        
        // Add click handler
        serverIcon.addEventListener('click', handleServerClick);
        
        // Show notification
        showNotification(`Server "${name}" created successfully!`);
        
        // Switch to new server
        handleServerClick({ currentTarget: serverIcon });
    }
    
    // Generate a random color
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    
    // Update all timestamps to show "Today at XX:XX"
    function updateTimestamps() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = (hours % 12) || 12;
        
        document.querySelectorAll('.date').forEach(date => {
            date.textContent = 'Today';
        });
        
        document.querySelectorAll('.message-timestamp').forEach(timestamp => {
            // Generate random minutes for existing messages to look natural
            const randomMinutes = Math.floor(Math.random() * 59).toString().padStart(2, '0');
            timestamp.textContent = `Today at ${formattedHours}:${randomMinutes} ${ampm}`;
        });
    }
    
    // Save user settings to localStorage
    function saveUserSettings() {
        const settings = {
            username: document.querySelector('.username').textContent,
            status: document.querySelector('.status').textContent,
            statusType: userStatus,
            isMuted: isMuted,
            isDeafened: isDeafened
        };
        
        localStorage.setItem('discord_clone_settings', JSON.stringify(settings));
    }
    
    // Load user settings from localStorage
    function loadUserSettings() {
        const settings = JSON.parse(localStorage.getItem('discord_clone_settings'));
        
        if (settings) {
            // Update username and status
            document.querySelectorAll('.username').forEach(el => {
                el.textContent = settings.username;
            });
            
            document.querySelector('.status').textContent = settings.status;
            
            // Update status indicators
            const userStatusIndicator = document.querySelector('.user-avatar .status-indicator');
            userStatusIndicator.className = 'status-indicator';
            userStatusIndicator.classList.add(settings.statusType);
            userStatus = settings.statusType;
            
            // Update mute/deafen state
            if (settings.isMuted) {
                isMuted = true;
                document.querySelector('.fa-microphone').classList.add('active');
                document.querySelector('.fa-microphone').classList.remove('fa-microphone');
            }
            
            if (settings.isDeafened) {
                isDeafened = true;
                document.querySelector('.fa-headphones').classList.add('active');
            }
        }
    }
    
    // Add Discord logo to the channel header
    function addDiscordLogo() {
        // Create the logo element
        const logoElement = document.createElement('div');
        logoElement.className = 'discord-logo';
        logoElement.innerHTML = '<i class="fab fa-discord"></i> Discord';
        
        // Insert it before the channel-info
        const channelInfo = document.querySelector('.channel-info');
        const channelHeader = document.querySelector('.channel-header');
        channelHeader.insertBefore(logoElement, channelInfo);
        
        // Add some margin to separate it from channel-info
        channelInfo.style.marginLeft = '20px';
    }
    
    // Preload all images to prevent blinking
    function preloadImages() {
        // Create a hidden div to store preloaded images
        const preloadDiv = document.createElement('div');
        preloadDiv.style.display = 'none';
        document.body.appendChild(preloadDiv);
        
        // Find all images in the document
        const images = document.querySelectorAll('img');
        const imageSources = new Set();
        
        // Collect all unique image sources
        images.forEach(img => {
            if (img.src && !img.src.startsWith('data:')) {
                imageSources.add(img.src);
            }
        });
        
        // Preload each image
        imageSources.forEach(src => {
            const img = new Image();
            img.src = src;
            preloadDiv.appendChild(img);
        });
        
        // Fix error handling for all images
        images.forEach(img => {
            img.addEventListener('error', function() {
                const defaultAvatar = img.classList.contains('user-avatar') || 
                                     img.parentElement.classList.contains('user-avatar') || 
                                     img.parentElement.classList.contains('message-avatar') ? 
                                     'assets/icons/default-avatar.svg' : 'assets/icons/discord-icon.svg';
                
                this.src = defaultAvatar;
                this.onerror = null; // Prevent infinite loop
            });
        });
    }

    // Function to load server-specific messages
    function loadServerMessages(server) {
        // Clear existing messages
        const messagesContainer = document.querySelector('.messages-container');
        while (messagesContainer.children.length > 0) {
            messagesContainer.removeChild(messagesContainer.lastChild);
        }
        
        // Add welcome message
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'welcome-message';
        welcomeMessage.innerHTML = `
            <div class="welcome-icon">
                <i class="fas fa-hashtag"></i>
            </div>
            <h2>Welcome to #general!</h2>
            <p>This is the start of the #general channel. Say hi!</p>
        `;
        messagesContainer.appendChild(welcomeMessage);
        
        // Add date marker
        const dateMarker = document.createElement('div');
        dateMarker.className = 'date-marker';
        dateMarker.innerHTML = `
            <div class="date-line"></div>
            <div class="date">Today</div>
            <div class="date-line"></div>
        `;
        messagesContainer.appendChild(dateMarker);
        
        // Add server-specific messages
        const messages = serverMessages[server] || [];
        messages.forEach(msg => {
            const messageEl = document.createElement('div');
            messageEl.className = 'message';
            
            let attachmentHTML = '';
            if (msg.attachment) {
                attachmentHTML = `
                    <div class="message-attachment">
                        <div class="attachment-thumbnail">
                            <img src="${msg.attachment.thumbnail}" alt="Attachment">
                        </div>
                        ${msg.attachment.title || msg.attachment.description ? `
                            <div class="attachment-details">
                                ${msg.attachment.title ? `<div class="attachment-title">${msg.attachment.title}</div>` : ''}
                                ${msg.attachment.description ? `<div class="attachment-desc">${msg.attachment.description}</div>` : ''}
                            </div>
                        ` : ''}
                    </div>
                `;
            }
            
            messageEl.innerHTML = `
                <div class="message-avatar">
                    <img src="${msg.avatar}" alt="${msg.author} Avatar">
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-author ${msg.authorClass}">${msg.author}</span>
                        <span class="message-timestamp">${msg.time}</span>
                    </div>
                    <div class="message-text">
                        ${msg.text}
                    </div>
                    ${attachmentHTML}
                </div>
            `;
            
            messagesContainer.appendChild(messageEl);
        });
    }
    
    // Load default server messages (coding)
    loadServerMessages(currentServer);

    // Add Logout functionality
    const logoutButton = document.querySelector('.sidebar-item.logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to log out?')) {
                localStorage.removeItem('discord_user');
                window.location.href = 'login.html';
            }
        });
    }

    // Initialize theme
    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        applyTheme(savedTheme);
        
        // Set up theme options
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            const theme = option.getAttribute('data-theme');
            if (theme === savedTheme) {
                option.classList.add('selected');
            }
            
            option.addEventListener('click', () => {
                themeOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                applyTheme(theme);
            });
        });
    }

    // Apply theme
    function applyTheme(theme) {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${theme}-theme`);
        localStorage.setItem('theme', theme);
        
        // Update theme preview images
        const themePreviews = document.querySelectorAll('.theme-preview');
        themePreviews.forEach(preview => {
            const previewTheme = preview.getAttribute('data-theme');
            if (previewTheme === theme) {
                preview.style.opacity = '1';
            } else {
                preview.style.opacity = '0.5';
            }
        });
    }

    // Toggle between dark and light themes
    function toggleTheme() {
        if (document.body.classList.contains('dark-theme')) {
            document.body.classList.replace('dark-theme', 'light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.replace('light-theme', 'dark-theme');
            localStorage.setItem('theme', 'dark');
        }
    }

    /**
     * Connect to a voice channel
     */
    function connectToVoice(channelName, channelElement) {
        // If already connected to a different channel, disconnect first
        if (activeVoiceChannel) {
            const oldChannel = document.querySelector(`.voice-channel span:contains("${activeVoiceChannel}")`).closest('.voice-channel');
            oldChannel.classList.remove('connected');
            
            // Remove user from previous channel's user count
            const oldVoiceIcons = oldChannel.querySelector('.voice-icons');
            if (oldVoiceIcons) {
                const userCount = oldVoiceIcons.querySelector('span');
                userCount.textContent = parseInt(userCount.textContent) - 1;
                
                // If no users left, remove the voice icons
                if (userCount.textContent === '0') {
                    oldChannel.removeChild(oldVoiceIcons);
                }
            }
        }
        
        // Update state
        activeVoiceChannel = channelName;
        voiceConnected = true;
        
        // Update UI
        channelElement.classList.add('connected');
        
        // Add user to channel's user count or create it if it doesn't exist
        let voiceIcons = channelElement.querySelector('.voice-icons');
        if (!voiceIcons) {
            voiceIcons = document.createElement('div');
            voiceIcons.className = 'voice-icons';
            voiceIcons.innerHTML = '<i class="fas fa-user"></i><span>1</span>';
            channelElement.appendChild(voiceIcons);
        } else {
            const userCount = voiceIcons.querySelector('span');
            userCount.textContent = parseInt(userCount.textContent) + 1;
        }
        
        // Add connected voice UI to user controls
        const userControls = document.querySelector('.user-controls');
        
        // Create voice connection UI if it doesn't exist
        if (!document.querySelector('.voice-connection')) {
            const voiceConnection = document.createElement('div');
            voiceConnection.className = 'voice-connection';
            voiceConnection.innerHTML = `
                <div class="voice-info">
                    <i class="fas fa-volume-up"></i>
                    <span>Connected to ${channelName}</span>
                </div>
                <div class="voice-actions">
                    <button class="disconnect-btn" title="Disconnect"><i class="fas fa-phone-slash"></i></button>
                </div>
            `;
            userControls.appendChild(voiceConnection);
            
            // Add disconnect event listener
            document.querySelector('.disconnect-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                disconnectFromVoice();
            });
        } else {
            // Update existing voice connection UI
            document.querySelector('.voice-info span').textContent = `Connected to ${channelName}`;
        }
        
        // Show notification
        showNotification(`Connected to voice channel: ${channelName}`);
    }

    /**
     * Disconnect from voice channel
     */
    function disconnectFromVoice() {
        if (!activeVoiceChannel) return;
        
        // Find the channel element
        const channelElement = Array.from(document.querySelectorAll('.voice-channel')).find(
            el => el.querySelector('span').textContent === activeVoiceChannel
        );
        
        // Update UI
        channelElement.classList.remove('connected');
        
        // Update user count
        const voiceIcons = channelElement.querySelector('.voice-icons');
        if (voiceIcons) {
            const userCount = voiceIcons.querySelector('span');
            userCount.textContent = parseInt(userCount.textContent) - 1;
            
            // If no users left, remove the voice icons
            if (userCount.textContent === '0') {
                channelElement.removeChild(voiceIcons);
            }
        }
        
        // Remove voice connection UI
        const voiceConnection = document.querySelector('.voice-connection');
        if (voiceConnection) {
            voiceConnection.remove();
        }
        
        // Update state
        activeVoiceChannel = null;
        voiceConnected = false;
        
        // Show notification
        showNotification('Disconnected from voice channel');
    }

    /**
     * Show a notification
     */
    function showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.querySelector('.app-container').appendChild(notification);
        }
        
        // Set notification content and show it
        notification.textContent = message;
        notification.className = `notification ${type}`;
        
        // Add show class to trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Fix for jQuery-like selector
    Element.prototype.contains = function(selector) {
        return this.textContent.includes(selector);
    };

    /**
     * Search messages in the current server
     */
    function searchMessages(query) {
        if (!query.trim()) {
            return;
        }
        
        const messages = serverMessages[currentServer] || [];
        const results = [];
        
        // Search through messages
        messages.forEach(message => {
            const text = message.text || '';
            if (text.toLowerCase().includes(query.toLowerCase())) {
                results.push(message);
            }
        });
        
        // Display search results
        displaySearchResults(query, results);
    }

    /**
     * Display search results in a modal
     */
    function displaySearchResults(query, results) {
        // Create search results modal if it doesn't exist
        let searchResultsModal = document.querySelector('.search-results-modal');
        if (searchResultsModal) {
            searchResultsModal.remove();
        }
        
        searchResultsModal = document.createElement('div');
        searchResultsModal.className = 'search-results-modal';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'search-results-header';
        header.innerHTML = `
            <h3>Search Results for "${query}"</h3>
            <span>${results.length} result${results.length === 1 ? '' : 's'}</span>
            <button class="search-close-btn"><i class="fas fa-times"></i></button>
        `;
        searchResultsModal.appendChild(header);
        
        // Create results container
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results-container';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">No messages found</div>';
        } else {
            // Add each result
            results.forEach(message => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                
                // Highlight the search term in the message
                const highlightedText = message.text.replace(
                    new RegExp(query, 'gi'),
                    match => `<span class="highlight">${match}</span>`
                );
                
                resultItem.innerHTML = `
                    <div class="result-user-info">
                        <img src="${message.avatar}" alt="${message.author}" class="result-avatar">
                        <div class="result-user-details">
                            <span class="result-username ${message.authorClass}">${message.author}</span>
                            <span class="result-time">${message.time}</span>
                        </div>
                    </div>
                    <div class="result-content">${highlightedText}</div>
                `;
                
                resultItem.addEventListener('click', () => {
                    // Close the search results
                    searchResultsModal.remove();
                    
                    // Find the message in the DOM and scroll to it
                    const messageElements = document.querySelectorAll('.message');
                    const targetIndex = serverMessages[currentServer].findIndex(m => 
                        m.author === message.author && m.text === message.text
                    );
                    
                    if (targetIndex >= 0 && messageElements[targetIndex]) {
                        // Highlight the message temporarily
                        messageElements[targetIndex].classList.add('highlight-message');
                        messageElements[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                        
                        // Remove highlight after a few seconds
                        setTimeout(() => {
                            messageElements[targetIndex].classList.remove('highlight-message');
                        }, 3000);
                    }
                });
                
                resultsContainer.appendChild(resultItem);
            });
        }
        
        searchResultsModal.appendChild(resultsContainer);
        
        // Add the modal to the page
        document.querySelector('.app-container').appendChild(searchResultsModal);
        
        // Add event listener to close button
        document.querySelector('.search-close-btn').addEventListener('click', () => {
            searchResultsModal.remove();
        });
        
        // Add event listener to close when clicking outside
        searchResultsModal.addEventListener('click', (e) => {
            if (e.target === searchResultsModal) {
                searchResultsModal.remove();
            }
        });
        
        // Clear search input
        const searchInput = document.querySelector('.search-container input');
        searchInput.value = '';
    }

    /**
     * Open user profile modal
     */
    function openUserProfileModal() {
        // Get current user
        const currentUser = JSON.parse(localStorage.getItem('discord_user'));
        if (!currentUser) return;
        
        // Create modal if it doesn't exist
        let profileModal = document.querySelector('.profile-modal');
        if (profileModal) {
            profileModal.remove();
        }
        
        profileModal = document.createElement('div');
        profileModal.className = 'profile-modal';
        
        // Get all users to check for unique username
        const users = JSON.parse(localStorage.getItem('discord_users') || '[]');
        
        // Create profile form
        profileModal.innerHTML = `
            <div class="profile-content">
                <div class="profile-header">
                    <h3>Edit Profile</h3>
                    <button class="profile-close-btn"><i class="fas fa-times"></i></button>
                </div>
                <div class="profile-body">
                    <div class="profile-avatar-section">
                        <div class="profile-avatar-container">
                            <img src="${currentUser.avatar || 'assets/icons/user-avatar.svg'}" alt="User Avatar" class="profile-avatar">
                            <div class="avatar-overlay">
                                <i class="fas fa-camera"></i>
                                <span>Change Avatar</span>
                            </div>
                        </div>
                        <input type="file" id="avatar-upload" accept="image/*" style="display: none;">
                    </div>
                    <div class="profile-form">
                        <div class="form-group">
                            <label for="profile-username">Username</label>
                            <input type="text" id="profile-username" class="form-input" value="${currentUser.username}" maxlength="32">
                            <div class="input-error"></div>
                        </div>
                        <div class="form-group">
                            <label for="profile-email">Email</label>
                            <input type="email" id="profile-email" class="form-input" value="${currentUser.email}" disabled>
                            <small>Email cannot be changed</small>
                        </div>
                        <div class="form-group">
                            <label for="profile-status">Custom Status</label>
                            <input type="text" id="profile-status" class="form-input" value="${currentUser.status || ''}" placeholder="What's happening?" maxlength="100">
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <div class="status-options">
                                <div class="status-option ${userStatus === 'online' ? 'selected' : ''}" data-status="online">
                                    <div class="status-indicator online"></div>
                                    <span>Online</span>
                                </div>
                                <div class="status-option ${userStatus === 'idle' ? 'selected' : ''}" data-status="idle">
                                    <div class="status-indicator idle"></div>
                                    <span>Idle</span>
                                </div>
                                <div class="status-option ${userStatus === 'dnd' ? 'selected' : ''}" data-status="dnd">
                                    <div class="status-indicator dnd"></div>
                                    <span>Do Not Disturb</span>
                                </div>
                                <div class="status-option ${userStatus === 'invisible' ? 'selected' : ''}" data-status="invisible">
                                    <div class="status-indicator invisible"></div>
                                    <span>Invisible</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="profile-footer">
                    <button class="cancel-btn">Cancel</button>
                    <button class="save-profile-btn">Save Changes</button>
                </div>
            </div>
        `;
        
        // Add the modal to the page
        document.querySelector('.app-container').appendChild(profileModal);
        
        // Add event listeners
        // Close button
        document.querySelector('.profile-close-btn').addEventListener('click', () => {
            profileModal.remove();
        });
        
        // Cancel button
        document.querySelector('.cancel-btn').addEventListener('click', () => {
            profileModal.remove();
        });
        
        // Avatar upload
        const avatarOverlay = document.querySelector('.avatar-overlay');
        const avatarUpload = document.getElementById('avatar-upload');
        const profileAvatar = document.querySelector('.profile-avatar');
        
        avatarOverlay.addEventListener('click', () => {
            avatarUpload.click();
        });
        
        avatarUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                showNotification('Avatar image must be less than 2MB', 'error');
                return;
            }
            
            // Check file type
            if (!file.type.startsWith('image/')) {
                showNotification('Please select an image file', 'error');
                return;
            }
            
            // Preview the image
            const reader = new FileReader();
            reader.onload = (event) => {
                profileAvatar.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
        
        // Status options
        document.querySelectorAll('.status-option').forEach(option => {
            option.addEventListener('click', () => {
                // Remove selected class from all options
                document.querySelectorAll('.status-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Add selected class to clicked option
                option.classList.add('selected');
            });
        });
        
        // Save button
        document.querySelector('.save-profile-btn').addEventListener('click', () => {
            // Get form values
            const username = document.getElementById('profile-username').value.trim();
            const customStatus = document.getElementById('profile-status').value.trim();
            const selectedStatus = document.querySelector('.status-option.selected').getAttribute('data-status');
            
            // Validate username
            if (!username) {
                document.querySelector('.input-error').textContent = 'Username is required';
                return;
            }
            
            // Check if username is already taken
            const existingUser = users.find(u => u.id !== currentUser.id && u.username === username);
            if (existingUser) {
                document.querySelector('.input-error').textContent = 'Username is already taken';
                return;
            }
            
            // Update user in localStorage
            currentUser.username = username;
            currentUser.status = customStatus;
            currentUser.avatar = profileAvatar.src;
            
            // Update userStatus
            userStatus = selectedStatus;
            
            // Save to localStorage
            localStorage.setItem('discord_user', JSON.stringify(currentUser));
            
            // Update user in users array
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].username = username;
                users[userIndex].status = customStatus;
                users[userIndex].avatar = profileAvatar.src;
                localStorage.setItem('discord_users', JSON.stringify(users));
            }
            
            // Update UI
            updateUserInfo();
            
            // Close modal
            profileModal.remove();
            
            // Show success notification
            showNotification('Profile updated successfully', 'success');
        });
        
        // Close when clicking outside
        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal) {
                profileModal.remove();
            }
        });
    }

    // Add mobile menu button to channel header
    const channelHeader = document.querySelector('.channel-header');
    if (channelHeader && window.innerWidth <= 576 && !document.querySelector('.mobile-menu-btn')) {
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        channelHeader.insertBefore(mobileMenuBtn, channelHeader.firstChild);
    }

    // Add close button to members sidebar
    const membersSidebar = document.querySelector('.members-sidebar');
    if (membersSidebar && !document.querySelector('.close-members-btn')) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-members-btn';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        membersSidebar.insertBefore(closeBtn, membersSidebar.firstChild);
    }

    // Mobile menu event listeners
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            document.querySelector('.channels-sidebar').classList.toggle('show');
        });
    }

    // Close members sidebar button
    const closeMembersBtn = document.querySelector('.close-members-btn');
    if (closeMembersBtn) {
        closeMembersBtn.addEventListener('click', () => {
            membersSidebar.classList.remove('show');
        });
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            // Reset to desktop view
            document.querySelector('.app-container').style.gridTemplateColumns = membersSidebarVisible
                ? '72px 240px 1fr 240px'
                : '72px 240px 1fr 0';
            membersSidebar.classList.remove('show');
        } else if (window.innerWidth <= 576) {
            // Mobile view
            document.querySelector('.channels-sidebar').classList.remove('show');
            
            // Add mobile menu button if it doesn't exist
            if (!document.querySelector('.mobile-menu-btn')) {
                const mobileMenuBtn = document.createElement('button');
                mobileMenuBtn.className = 'mobile-menu-btn';
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                mobileMenuBtn.addEventListener('click', () => {
                    document.querySelector('.channels-sidebar').classList.toggle('show');
                });
                channelHeader.insertBefore(mobileMenuBtn, channelHeader.firstChild);
            }
        }
    });

    // Initialize settings
    function initializeSettings() {
        // Initialize theme options
        initializeTheme();
        
        // Initialize appearance toggles
        const appearanceToggles = document.querySelectorAll('.appearance-toggle');
        appearanceToggles.forEach(toggle => {
            const setting = toggle.getAttribute('data-setting');
            const savedValue = localStorage.getItem(`appearance_${setting}`) === 'true';
            toggle.checked = savedValue;
            
            toggle.addEventListener('change', () => {
                updateAppearanceSetting(setting, toggle.checked);
            });
        });
        
        // Initialize language settings
        const languageSelect = document.getElementById('language-select');
        const savedLanguage = localStorage.getItem('language') || 'en-US';
        languageSelect.value = savedLanguage;
        
        const languageToggles = document.querySelectorAll('.language-toggle');
        languageToggles.forEach(toggle => {
            const setting = toggle.getAttribute('data-setting');
            const savedValue = localStorage.getItem(`language_${setting}`) === 'true';
            toggle.checked = savedValue;
            
            toggle.addEventListener('change', () => {
                updateLanguageSetting(setting, toggle.checked);
            });
        });
        
        // Initialize sidebar items
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove selected class from all items
                sidebarItems.forEach(si => si.classList.remove('selected'));
                // Add selected class to clicked item
                item.classList.add('selected');
                
                // Hide all sections
                document.querySelectorAll('.settings-section').forEach(section => {
                    section.classList.remove('active');
                });
                
                // Show corresponding section
                const sectionId = item.getAttribute('data-section');
                const section = document.getElementById(sectionId);
                if (section) {
                    section.classList.add('active');
                }
                
                // Update modal header title
                const modalTitle = document.querySelector('.modal-header h3');
                if (modalTitle) {
                    modalTitle.textContent = item.textContent.trim();
                }
            });
        });
    }

    function updateAppearanceSetting(setting, enabled) {
        // Get current settings
        const settings = JSON.parse(localStorage.getItem('discord_appearance_settings') || '{}');
        // Update setting
        settings[setting] = enabled;
        // Save settings
        localStorage.setItem('discord_appearance_settings', JSON.stringify(settings));
        
        // Apply setting changes
        switch (setting) {
            case 'compact-mode':
                document.body.classList.toggle('compact-mode', enabled);
                break;
            case 'show-timestamps':
                document.querySelectorAll('.message-timestamp').forEach(timestamp => {
                    timestamp.style.display = enabled ? 'block' : 'none';
                });
                break;
        }
    }

    function updateLanguage(language) {
        // Save language preference
        localStorage.setItem('language', language);
        // Apply language changes
        document.documentElement.lang = language;
        // Show notification
        showNotification(`Language changed to ${language}`);
    }

    function updateLanguageSetting(setting, enabled) {
        // Get current settings
        const settings = JSON.parse(localStorage.getItem('discord_language_settings') || '{}');
        // Update setting
        settings[setting] = enabled;
        // Save settings
        localStorage.setItem('discord_language_settings', JSON.stringify(settings));
        
        // Apply setting changes
        switch (setting) {
            case 'show-images':
                document.querySelectorAll('.message img').forEach(img => {
                    img.style.display = enabled ? 'block' : 'none';
                });
                break;
            case 'show-emojis':
                document.querySelectorAll('.message .emoji').forEach(emoji => {
                    emoji.style.display = enabled ? 'inline-block' : 'none';
                });
                break;
        }
    }
}); 