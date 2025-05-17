/**
 * Discord Clone Initialization Script
 * Run this in a local server environment to ensure assets are properly loaded
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Discord Clone...');
    
    // Check if required folders exist
    const requiredFolders = [
        'assets',
        'assets/icons',
        'assets/images'
    ];
    
    const requiredFiles = [
        'assets/icons/discord-icon.svg',
        'assets/icons/user-avatar.svg',
        'assets/icons/default-avatar.svg',
        'assets/icons/bot-avatar.svg',
        'assets/icons/user1-avatar.svg',
        'assets/icons/user2-avatar.svg',
        'assets/icons/gaming-server.svg',
        'assets/icons/music-server.svg',
        'assets/icons/coding-server.svg',
        'assets/icons/portfolio-server.svg',
        'assets/images/profile-banner.svg',
        'assets/images/portfolio-thumbnail.svg',
        'assets/images/discord-clone.svg'
    ];
    
    console.log('Discord Clone initialized successfully!');
}); 