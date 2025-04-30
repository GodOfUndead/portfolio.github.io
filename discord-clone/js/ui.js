/**
 * UI Module
 * Handles UI interactions and modal management
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const settingsBtn = document.getElementById('settings-button');
    const settingsModal = document.getElementById('settings-modal');
    const settingsSections = document.querySelectorAll('.settings-section');
    const avatarUpload = document.getElementById('avatar-upload');
    const settingsAvatar = document.getElementById('settings-avatar');
    const saveSettingsBtn = document.getElementById('save-settings');
    
    // Settings button
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            if (settingsModal) {
                settingsModal.classList.add('active');
                
                // Update user info in settings
                if (window.auth && window.auth.isLoggedIn()) {
                    const currentUser = window.auth.getCurrentUser();
                    if (currentUser) {
                        document.getElementById('settings-username').textContent = currentUser.username;
                        document.getElementById('settings-email').value = currentUser.email || '';
                        if (currentUser.avatar) {
                            document.getElementById('settings-avatar').src = currentUser.avatar;
                        }
                    }
                }
            }
        });
    }
    
    // Settings sections selection
    if (settingsSections) {
        settingsSections.forEach(section => {
            section.addEventListener('click', () => {
                // Only handle sections that aren't the last one (logout)
                if (section !== settingsSections[settingsSections.length - 1]) {
                    settingsSections.forEach(s => s.classList.remove('active'));
                    section.classList.add('active');
                }
            });
        });
    }
    
    // Avatar upload handling
    if (document.querySelector('.profile-avatar')) {
        document.querySelector('.profile-avatar').addEventListener('click', () => {
            if (avatarUpload) {
                avatarUpload.click();
            }
        });
    }
    
    if (avatarUpload) {
        avatarUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && settingsAvatar) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    settingsAvatar.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Save settings
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            saveUserSettings();
        });
    }
    
    // Close settings modal
    if (document.querySelector('#settings-modal .close')) {
        document.querySelector('#settings-modal .close').addEventListener('click', () => {
            if (settingsModal) {
                settingsModal.classList.remove('active');
            }
        });
    }
    
    // Close modals when clicking outside the modal content
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Prevent propagation of clicks on modal content
    document.querySelectorAll('.modal-content').forEach(content => {
        content.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
    
    // Make sure escape key closes modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });
    
    // Close modals when clicking on the X button
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modal = closeBtn.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
});

// Save user settings
function saveUserSettings() {
    if (!window.auth || !window.auth.isLoggedIn()) return;
    
    const currentUser = window.auth.getCurrentUser();
    if (!currentUser) return;
    
    // Get new values
    const newPassword = document.getElementById('settings-new-password')?.value;
    const currentPassword = document.getElementById('settings-current-password')?.value;
    const newAvatar = document.getElementById('settings-avatar')?.src;
    
    // Update user information in localStorage
    const usersDB = localStorage.getItem('discord_users') ? 
        JSON.parse(localStorage.getItem('discord_users')) : [];
    
    const userIndex = usersDB.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        // Update avatar
        if (newAvatar && newAvatar !== usersDB[userIndex].avatar) {
            usersDB[userIndex].avatar = newAvatar;
            currentUser.avatar = newAvatar;
            
            // Update UI
            document.getElementById('user-avatar').src = newAvatar;
        }
        
        // Update password
        if (newPassword && currentPassword) {
            if (currentPassword === usersDB[userIndex].password) {
                usersDB[userIndex].password = newPassword;
                
                // Clear password fields
                if (document.getElementById('settings-new-password')) {
                    document.getElementById('settings-new-password').value = '';
                }
                if (document.getElementById('settings-current-password')) {
                    document.getElementById('settings-current-password').value = '';
                }
                
                alert('Password updated successfully!');
            } else {
                alert('Current password is incorrect.');
                return;
            }
        }
        
        // Save to localStorage
        localStorage.setItem('discord_users', JSON.stringify(usersDB));
        localStorage.setItem('discord_current_user', JSON.stringify(currentUser));
        
        alert('Settings saved successfully!');
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal) {
            settingsModal.classList.remove('active');
        }
    }
}

// Toggle mobile navigation
function toggleMobileNav() {
    const channelsSidebar = document.querySelector('.channels-sidebar');
    channelsSidebar.classList.toggle('active');
}

// Check if mobile view and add necessary event listeners
function setupMobileView() {
    if (window.innerWidth <= 576) {
        // Add hamburger menu for mobile
        const hamburgerMenu = document.createElement('div');
        hamburgerMenu.className = 'hamburger-menu';
        hamburgerMenu.innerHTML = '<i class="fas fa-bars"></i>';
        
        hamburgerMenu.addEventListener('click', toggleMobileNav);
        
        // Add to chat header
        document.querySelector('.chat-header-left').prepend(hamburgerMenu);
    }
}

// Check window size on load and resize
window.addEventListener('load', setupMobileView);
window.addEventListener('resize', setupMobileView);

// Expose functions to other modules
window.ui = {
    toggleMobileNav
}; 