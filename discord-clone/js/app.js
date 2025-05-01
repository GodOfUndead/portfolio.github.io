/**
 * Main Application
 * Initializes the Discord clone app and handles global state
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Discord Clone Initialized');
    
    // Add some CSS styles for mobile hamburger menu
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 576px) {
            .hamburger-menu {
                cursor: pointer;
                margin-right: 10px;
                font-size: 20px;
                color: var(--interactive-normal);
            }
            
            .hamburger-menu:hover {
                color: var(--interactive-hover);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Create asset directory and default images if needed in production environment
    createDefaultAssets();
    
    // Initialize authentication
    if (window.auth && typeof window.auth.initAuth === 'function') {
        window.auth.initAuth();
    }
    
    // Initialize WebSocket connection after authentication
    setTimeout(() => {
        if (window.socket && typeof window.socket.initializeSocket === 'function') {
            window.socket.initializeSocket();
        }
    }, 500);
    
    // Initialize servers module
    if (window.servers && typeof window.servers.loadUserServers === 'function') {
        window.servers.loadUserServers();
    }
    
    // Show authentication modal if user is not logged in
    if (window.auth && !window.auth.isLoggedIn()) {
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.classList.add('active');
        }
    }
    
    // Initialize notifications
    initializeNotifications();
});

// Function to check if notifications are supported and request permission
function initializeNotifications() {
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notifications");
        return;
    }
    
    if (Notification.permission !== "denied" && Notification.permission !== "granted") {
        Notification.requestPermission().then(permission => {
            console.log(`Notification permission: ${permission}`);
        });
    }
}

// Function to create default assets for first-time users
function createDefaultAssets() {
    // For a real app, this would be pre-configured
    // In this demo, we'll check if assets exist and create them if not
    
    // Convert defaults to Data URLs for demo purposes
    
    // Default Discord logo (for system messages)
    const discordLogo = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDUgMjQwIj48cGF0aCBkPSJNMTA0LjQgMTAzLjljLTUuNyAwLTEwLjIgNS0xMC4yIDExLjFzNC42IDExLjEgMTAuMiAxMS4xYzUuNyAwIDEwLjItNSAxMC4yLTExLjEuMS02LjEtNC41LTExLjEtMTAuMi0xMS4xek0xNDAuOSAxMDMuOWMtNS43IDAtMTAuMiA1LTEwLjIgMTEuMXM0LjYgMTEuMSAxMC4yIDExLjFjNS43IDAgMTAuMi01IDEwLjItMTEuMXMtNC41LTExLjEtMTAuMi0xMS4xeiIgZmlsbD0iIzcyODlEQSIvPjxwYXRoIGQ9Ik0xODkuNSAyMGgtMTM0QzQ0LjIgMjAgMzUgMjkuMiAzNSA0MC42djEzNS4yYzAgMTEuNCA5LjIgMjAuNiAyMC41IDIwLjZoMTEzLjRsLTUuMy0xOC41IDEyLjggMTEuOSAxMi4xIDExLjIgMjEuNSAxOVY0MC42YzAtMTEuNC05LjItMjAuNi0yMC41LTIwLjZ6bS0zOC42IDEzMC42cy0zLjYtNC4zLTYuNi04LjFjMTMuMS0zLjcgMTguMS0xMS45IDE4LjEtMTEuOS00LjEgMi43LTggNC42LTExLjUgNS45LTUgMi4xLTkuOCAzLjUtMTQuNSA0LjMtOS42IDEuOC0xOC40IDEuMy0yNS45LS4xLTUuNy0xLjEtMTAuNi0yLjctMTQuNy00LjMtMi4zLS45LTQuOC0yLTcuMy0zLjQtLjMtLjItLjYtLjMtLjktLjUtLjItLjEtLjMtLjItLjQtLjMtMS44LTEtMi44LTEuNy0yLjgtMS43czQuOCA4IDE3LjUgMTEuOGMtMyAzLjgtNi43IDguMy02LjcgOC4zLTIyLjEtLjctMzAuNS0xNS4yLTMwLjUtMTUuMiAwLTMyLjIgMTQuNC01OC4zIDE0LjQtNTguMyAxNC40LTEwLjggMjguMS0xMC41IDI4LjEtMTAuNWwxIDEuMmMtMTggNS4yLTI2LjMgMTMuMS0yNi4zIDEzLjFzMi4yLTEuMiA1LjktMi45YzEwLjctNC43IDE5LjItNiAyMi43LTYuMy42LS4xIDEuMS0uMiAxLjctLjIgNi4xLS44IDEzLTEgMjAuMi0uMiA5LjUgMS4xIDE5LjcgMy45IDMwLjEgOS42IDAgMC03LjktNy41LTI0LjktMTIuN2wxLjQtMS42czEzLjctLjMgMjguMSAxMC41YzAgMCAxNC40IDI2LjEgMTQuNCA1OC4zIDAgMC04LjUgMTQuNS0zMC42IDE1LjJ6IiBmaWxsPSIjNzI4OURBIi8+PC9zdmc+';
    
    // Default server icon
    const defaultServer = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iNjQiIGZpbGw9IiM3Mjg5REEiLz4KPHBhdGggZD0iTTg3LjU0MjkgNTUuNzxmb250LWZhbWlseT4xNkM4Ny44MjI5IDQ5LjkyNjIgODMuNTUxNiA0NC44MTQzIDc3Ljc2ODcgNDQuNTI1NEM3Ny41NDA4IDQ0LjUyNTQgNzcuNTQwOCA0NC41MjU0IDc3LjMxMjkgNDQuNTI1NEM3NC41NjQxIDM3LjQxNjggNjcuMjEyMiAzMy4xNiA1OS42MjgzIDM0LjMxOTdDNTIuMDQ0NCAzNS40Nzk0IDQ2LjQ5MTQgNDEuODM1OCA0Ni40OTE0IDQ5LjM2ODJDMzkuNDI2NiA0OS45MjYyIDM0LjA2MjQgNTYuMzA5NCAzNC4zNDI0IDYzLjQxOEMzNC42MjIzIDcwLjUyNjYgNDAuNDYyMiA3Ni4xNDM0IDQ3LjU2OTUgNzYuMTQzNEg4My4wNDM3Qzg5LjQyMjggNzYuMTQzNCA5NC42NzA4IDcwLjY2MzcgOTQuNzUyOCA2NC4zNDE3Qzk0LjgzNDggNTguMDE5OCA5MC44OTI5IDUyLjY5OCA4NC45Njk4IDUyLjQ5OTRDODcuNDE1IDE1Mi4wNzc0IDg3LjQxNSA1My45MjYyIDg3LjU0MjkgNTUuNzE2WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==';
    
    // Default avatar
    const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjY0IiBjeT0iNjQiIHI9IjY0IiBmaWxsPSIjOTk5OTk5Ii8+CjxjaXJjbGUgY3g9IjY0IiBjeT0iNDYiIHI9IjIwIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTAyIDEwMi42NjdDMTAyIDEyMS4wMTQgODQuNzQgMTI2IDY0IDEyNkM0My4yNiAxMjYgMjYgMTIxLjAxNCAyNiAxMDIuNjY3QzI2IDg0LjMyIDQzLjI2IDY5LjMzMzMgNjQgNjkuMzMzM0M4NC43NCA2OS4zMzMzIDEwMiA4NC4zMiAxMDIgMTAyLjY2N1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';
        
    // Create localStorage for these assets if they don't exist
    if (!localStorage.getItem('discord_default_avatar')) {
        localStorage.setItem('discord_default_avatar', defaultAvatar);
    }
    
    if (!localStorage.getItem('discord_default_server')) {
        localStorage.setItem('discord_default_server', defaultServer);
    }
    
    if (!localStorage.getItem('discord_logo')) {
        localStorage.setItem('discord_logo', discordLogo);
    }
}

// Export necessary functions for global access
window.app = {
    initializeNotifications,
    createDefaultAssets
}; 