/**
 * Authentication Module
 * Handles user registration, login, and session management
 */

// Mock database for demo purposes
const usersDB = [];

// Check if there's stored user data
if (localStorage.getItem('discord_users')) {
    try {
        const storedUsers = JSON.parse(localStorage.getItem('discord_users'));
        usersDB.push(...storedUsers);
    } catch (e) {
        console.error('Error loading users from localStorage', e);
    }
}

// If no users exist, create a demo user
if (usersDB.length === 0) {
    const demoUser = {
        id: generateId(),
        username: 'DemoUser',
        email: 'demo@example.com',
        password: 'password123',
        avatar: 'assets/default-avatar.png',
        status: 'online',
        createdAt: new Date().toISOString()
    };
    usersDB.push(demoUser);
    saveUsersToStorage();
}

// Check for logged in user on page load
let currentUser = null;

// On page load, check if a user is logged in
document.addEventListener('DOMContentLoaded', () => {
    // Check if there's a stored session
    const storedUser = localStorage.getItem('discord_current_user');
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            updateUIForLoggedInUser();
        } catch (e) {
            console.error('Error loading current user from localStorage', e);
            showAuthModal();
        }
    } else {
        showAuthModal();
    }
});

// Show auth modal when page loads if no user is logged in
function showAuthModal() {
    const authModal = document.getElementById('auth-modal');
    authModal.classList.add('active');
}

// Update UI after successful login
function updateUIForLoggedInUser() {
    if (!currentUser) return;
    
    // Update user info in the UI
    document.getElementById('username').textContent = currentUser.username;
    document.getElementById('user-id').textContent = `#${currentUser.id.substring(0, 4)}`;
    
    if (currentUser.avatar) {
        document.getElementById('user-avatar').src = currentUser.avatar;
        document.getElementById('settings-avatar').src = currentUser.avatar;
    }
    
    document.getElementById('settings-username').textContent = currentUser.username;
    document.getElementById('settings-email').value = currentUser.email;
    
    // Load user's servers
    loadUserServers();
    
    // Hide auth modal if it's open
    document.getElementById('auth-modal').classList.remove('active');
}

// Handle tab switching in auth form
const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
const registerTab = document.querySelector('.auth-tab[data-tab="register"]');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
});

// Switch between login and register forms via links
document.getElementById('switch-to-register').addEventListener('click', (e) => {
    e.preventDefault();
    registerTab.click();
});

document.getElementById('switch-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    loginTab.click();
});

// Close buttons for modals
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        const modal = closeBtn.closest('.modal');
        modal.classList.remove('active');
    });
});

// Handle login form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const user = usersDB.find(u => u.email === email && u.password === password);
    
    if (user) {
        loginUser(user);
    } else {
        showError(loginForm, 'Invalid email or password');
    }
});

// Handle register form submission
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Validate inputs
    if (password !== confirmPassword) {
        showError(registerForm, 'Passwords do not match');
        return;
    }
    
    if (usersDB.some(u => u.email === email)) {
        showError(registerForm, 'Email already in use');
        return;
    }
    
    if (usersDB.some(u => u.username === username)) {
        showError(registerForm, 'Username already taken');
        return;
    }
    
    // Create new user
    const newUser = {
        id: generateId(),
        username,
        email,
        password,
        avatar: 'assets/default-avatar.png',
        status: 'online',
        createdAt: new Date().toISOString()
    };
    
    // Add to "database"
    usersDB.push(newUser);
    
    // Save to localStorage
    saveUsersToStorage();
    
    // Log the user in
    loginUser(newUser);
});

// Login a user
function loginUser(user) {
    currentUser = { ...user };
    delete currentUser.password; // Don't store password in session
    
    // Save to localStorage
    localStorage.setItem('discord_current_user', JSON.stringify(currentUser));
    
    // Update UI for logged in user
    updateUIForLoggedInUser();
}

// Logout user
function logoutUser() {
    currentUser = null;
    localStorage.removeItem('discord_current_user');
    showAuthModal();
}

// Display error message in form
function showError(form, message) {
    // Check if error element already exists
    let errorEl = form.querySelector('.error-message');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        form.querySelector('button[type="submit"]').insertAdjacentElement('beforebegin', errorEl);
    }
    
    errorEl.textContent = message;
    errorEl.style.color = 'var(--discord-red)';
    errorEl.style.marginBottom = '16px';
    errorEl.style.fontSize = '14px';
    
    // Clear after 3 seconds
    setTimeout(() => {
        errorEl.textContent = '';
    }, 3000);
}

// Generate a unique ID
function generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// Save users to localStorage
function saveUsersToStorage() {
    localStorage.setItem('discord_users', JSON.stringify(usersDB));
}

// Handle logout
document.querySelector('.settings-section:last-child').addEventListener('click', () => {
    logoutUser();
    document.getElementById('settings-modal').classList.remove('active');
});

// Initialize authentication
function initAuth() {
    // Check if there's a stored session
    const storedUser = localStorage.getItem('discord_current_user');
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            updateUIForLoggedInUser();
        } catch (e) {
            console.error('Error loading current user from localStorage', e);
            showAuthModal();
        }
    } else {
        // Auto-login as demo user for now
        const demoUser = usersDB.find(u => u.username === 'DemoUser');
        if (demoUser) {
            loginUser(demoUser);
        } else {
            showAuthModal();
        }
    }
}

// Initialize logout button
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logoutUser();
        });
    }
});

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Check if user is logged in
function isLoggedIn() {
    return currentUser !== null;
}

// Get user by ID
function getUserById(userId) {
    return usersDB.find(u => u.id === userId);
}

// Expose functions for other modules
window.auth = {
    initAuth,
    getCurrentUser,
    isLoggedIn,
    getUserById,
    loginUser,
    logoutUser
}; 