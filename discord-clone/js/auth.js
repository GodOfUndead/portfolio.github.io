/**
 * Discord Clone
 * Authentication JavaScript file
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Check if user is already logged in
    if (isLoggedIn() && !isAuthPage()) {
        // User is already logged in and trying to access an auth page, redirect to app
        window.location.href = 'index.html';
    } else if (!isLoggedIn() && !isAuthPage()) {
        // User is not logged in and trying to access the app, redirect to login
        window.location.href = 'login.html';
    }
    
    // Initialize theme based on saved preference
    initializeTheme();
    
    // Theme toggle functionality
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    // Populate date of birth selects
    if (document.getElementById('dob-day')) {
        populateDays();
        populateYears();
    }
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Initialize any input error handlers
    initializeInputValidation();
    
    // Functions
    
    // Check if user is logged in
    function isLoggedIn() {
        return localStorage.getItem('discord_user') !== null;
    }
    
    // Check if current page is login or register
    function isAuthPage() {
        return window.location.pathname.includes('login.html') || 
               window.location.pathname.includes('register.html');
    }
    
    // Initialize theme based on saved preference
    function initializeTheme() {
        const savedTheme = localStorage.getItem('discord_theme') || 'dark';
        document.body.className = savedTheme + '-theme';
        
        // Update toggle button text and icon
        if (themeToggleBtn) {
            if (savedTheme === 'dark') {
                themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i> Switch to Light Mode';
            } else {
                themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i> Switch to Dark Mode';
            }
        }
    }
    
    // Toggle between dark and light themes
    function toggleTheme() {
        if (document.body.classList.contains('dark-theme')) {
            document.body.classList.replace('dark-theme', 'light-theme');
            localStorage.setItem('discord_theme', 'light');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i> Switch to Dark Mode';
        } else {
            document.body.classList.replace('light-theme', 'dark-theme');
            localStorage.setItem('discord_theme', 'dark');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i> Switch to Light Mode';
        }
    }
    
    // Populate days dropdown
    function populateDays() {
        const daySelect = document.getElementById('dob-day');
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i.toString().padStart(2, '0');
            option.textContent = i;
            daySelect.appendChild(option);
        }
    }
    
    // Populate years dropdown (allow users from age 13+)
    function populateYears() {
        const yearSelect = document.getElementById('dob-year');
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 100;
        const endYear = currentYear - 13;
        
        for (let i = endYear; i >= startYear; i--) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.textContent = i;
            yearSelect.appendChild(option);
        }
    }
    
    // Handle login form submission
    function handleLogin(e) {
        e.preventDefault();
        
        // Get form data
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Simulate loading
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.innerHTML = '<div class="loading-spinner"></div>';
        submitBtn.disabled = true;
        
        // Clear any previous error messages
        clearErrorMessages();
        
        // Simulate API call (setTimeout)
        setTimeout(() => {
            // Check if user exists in local storage
            const users = JSON.parse(localStorage.getItem('discord_users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                // Success, set user as logged in
                const loggedInUser = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar || 'assets/icons/user-avatar.svg'
                };
                
                localStorage.setItem('discord_user', JSON.stringify(loggedInUser));
                
                // Redirect to app
                window.location.href = 'index.html';
            } else {
                // Show error message
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.style.display = 'block';
                errorMsg.textContent = 'Invalid email or password.';
                loginForm.insertBefore(errorMsg, submitBtn);
                
                // Reset button
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        }, 1000);
    }
    
    // Handle register form submission
    function handleRegister(e) {
        e.preventDefault();
        
        // Get form data
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const dobMonth = document.getElementById('dob-month').value;
        const dobDay = document.getElementById('dob-day').value;
        const dobYear = document.getElementById('dob-year').value;
        const termsAccepted = document.getElementById('terms').checked;
        
        // Simulate loading
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.innerHTML = '<div class="loading-spinner"></div>';
        submitBtn.disabled = true;
        
        // Clear any previous error messages
        clearErrorMessages();
        
        // Basic validation
        let hasError = false;
        
        if (password !== confirmPassword) {
            showError('confirm-password', 'Passwords do not match.');
            hasError = true;
        }
        
        if (!termsAccepted) {
            showError('terms', 'You must accept the terms to continue.');
            hasError = true;
        }
        
        // Age validation (must be 13+)
        const birthDate = new Date(`${dobYear}-${dobMonth}-${dobDay}`);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        if (age < 13) {
            showError('dob-year', 'You must be at least 13 years old to use Discord.');
            hasError = true;
        }
        
        if (hasError) {
            // Reset button if there are errors
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            return;
        }
        
        // Simulate API call (setTimeout)
        setTimeout(() => {
            // Check if user already exists
            const users = JSON.parse(localStorage.getItem('discord_users') || '[]');
            const existingUser = users.find(u => u.email === email);
            
            if (existingUser) {
                showError('email', 'An account with this email already exists.');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                return;
            }
            
            // Create new user
            const newUser = {
                id: generateUniqueId(),
                username,
                email,
                password,
                dateOfBirth: `${dobYear}-${dobMonth}-${dobDay}`,
                avatar: null,
                createdAt: new Date().toISOString()
            };
            
            // Add to users array and save to localStorage
            users.push(newUser);
            localStorage.setItem('discord_users', JSON.stringify(users));
            
            // Auto-login the new user
            const loggedInUser = {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                avatar: newUser.avatar || 'assets/icons/user-avatar.svg'
            };
            
            localStorage.setItem('discord_user', JSON.stringify(loggedInUser));
            
            // Show success message and redirect after delay
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.style.display = 'block';
            successMsg.textContent = 'Registration successful! Redirecting to Discord...';
            registerForm.insertBefore(successMsg, registerForm.firstChild);
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }, 1000);
    }
    
    // Display error message for specific input
    function showError(inputId, message) {
        const input = document.getElementById(inputId);
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.style.display = 'block';
        errorMsg.textContent = message;
        
        // Insert error message after the input
        input.parentNode.insertBefore(errorMsg, input.nextSibling);
        
        // Highlight the input
        input.style.borderColor = 'var(--dark-danger)';
    }
    
    // Clear all error messages
    function clearErrorMessages() {
        document.querySelectorAll('.error-message').forEach(msg => msg.remove());
        document.querySelectorAll('input').forEach(input => {
            input.style.borderColor = '';
        });
    }
    
    // Initialize input validation
    function initializeInputValidation() {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        
        if (confirmPasswordInput && passwordInput) {
            confirmPasswordInput.addEventListener('input', () => {
                if (passwordInput.value !== confirmPasswordInput.value) {
                    confirmPasswordInput.style.borderColor = 'var(--dark-danger)';
                } else {
                    confirmPasswordInput.style.borderColor = 'var(--dark-accent)';
                }
            });
        }
    }
    
    // Generate a unique ID for users
    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
}); 