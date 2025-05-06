// Auth class to handle user authentication
class Auth {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user')) || null;
    this.isAuthenticated = !!this.token;
    
    // DOM Elements
    this.loginLink = document.getElementById('login-link');
    this.loginModal = document.getElementById('login-modal');
    this.closeLogin = document.getElementById('close-login');
    this.loginForm = document.getElementById('login-form');
    this.registerForm = document.getElementById('register-form');
    this.tabBtns = document.querySelectorAll('.tab-btn');
    this.tabContents = document.querySelectorAll('.tab-content');
    this.tabLinks = document.querySelectorAll('.tab-link');
    this.loginFooter = document.getElementById('login-footer');
    this.registerFooter = document.getElementById('register-footer');
    this.rememberMeCheckbox = document.getElementById('remember');
    this.forgotPasswordLink = document.querySelector('.forgot-password');
    
    this.initialize();
  }
  
  // Initialize event listeners
  initialize() {
    // Open login modal
    this.loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.openLoginModal();
    });
    
    // Close login modal
    this.closeLogin.addEventListener('click', () => {
      this.closeLoginModal();
    });
    
    // Tab functionality
    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });
    
    // Tab links in footer
    this.tabLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.dataset.tab;
        this.switchTab(tab);
      });
    });
    
    // Login form submission
    this.loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.login();
    });
    
    // Register form submission
    this.registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.register();
    });
    
    // Forgot password
    if (this.forgotPasswordLink) {
      this.forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.forgotPassword();
      });
    }
    
    // Update UI based on auth state
    this.updateUI();
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === this.loginModal) {
        this.closeLoginModal();
      }
    });

    // Check for remembered user
    this.checkRememberedUser();
  }
  
  // Open login modal
  openLoginModal() {
    this.loginModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }
  
  // Close login modal
  closeLoginModal() {
    this.loginModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  }
  
  // Switch between login and register tabs
  switchTab(tab) {
    this.tabBtns.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.tab === tab) {
        btn.classList.add('active');
      }
    });
    
    this.tabContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === `${tab}-tab`) {
        content.classList.add('active');
      }
    });

    // Update footer visibility
    if (tab === 'login') {
      this.loginFooter.style.display = 'block';
      this.registerFooter.style.display = 'none';
    } else {
      this.loginFooter.style.display = 'none';
      this.registerFooter.style.display = 'block';
    }
  }
  
  // Login functionality
  login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = this.rememberMeCheckbox.checked;
    
    // In a real app, you would make an API call here
    // For demo purposes, we'll simulate a successful login
    if (email && password) {
      const user = {
        id: 1,
        name: email.split('@')[0], // Just use part of email as name for demo
        email: email
      };
      
      // Set auth state
      this.token = 'demo-token';
      this.user = user;
      this.isAuthenticated = true;
      
      // Save to localStorage
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
      
      // Remember user if checkbox is checked
      if (rememberMe) {
        localStorage.setItem('rememberedUser', email);
      } else {
        localStorage.removeItem('rememberedUser');
      }
      
      // Update UI
      this.updateUI();
      
      // Show success message and close modal
      this.showMessage('Login successful!', 'success');
      setTimeout(() => {
        this.closeLoginModal();
      }, 1500);
    } else {
      this.showMessage('Please fill in all fields', 'error');
    }
  }
  
  // Register functionality
  register() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Validate passwords
    if (password !== confirmPassword) {
      this.showMessage('Passwords do not match', 'error');
      return;
    }
    
    // In a real app, you would make an API call here
    // For demo purposes, we'll simulate a successful registration
    if (name && email && password) {
      const user = {
        id: 1,
        name: name,
        email: email
      };
      
      // Set auth state
      this.token = 'demo-token';
      this.user = user;
      this.isAuthenticated = true;
      
      // Save to localStorage
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
      
      // Update UI
      this.updateUI();
      
      // Show success message and close modal
      this.showMessage('Registration successful!', 'success');
      setTimeout(() => {
        this.closeLoginModal();
      }, 1500);
    } else {
      this.showMessage('Please fill in all fields', 'error');
    }
  }

  // Forgot password functionality
  forgotPassword() {
    const email = document.getElementById('login-email').value;
    
    if (email) {
      // In a real app, you would send a reset email
      this.showMessage('Password reset email sent. Please check your inbox.', 'info');
    } else {
      this.showMessage('Please enter your email address first', 'error');
    }
  }
  
  // Logout functionality
  logout() {
    // Clear auth state
    this.token = null;
    this.user = null;
    this.isAuthenticated = false;
    
    // Remove from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Update UI
    this.updateUI();
    
    // Show success message
    this.showMessage('Logged out successfully', 'success');
  }
  
  // Check for remembered user
  checkRememberedUser() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      const loginEmail = document.getElementById('login-email');
      if (loginEmail) {
        loginEmail.value = rememberedUser;
        this.rememberMeCheckbox.checked = true;
      }
    }
  }
  
  // Update UI based on auth state
  updateUI() {
    if (this.isAuthenticated && this.user) {
      // User is logged in
      this.loginLink.innerHTML = `<i class="fas fa-user"></i> ${this.user.name} <i class="fas fa-sign-out-alt ml-2"></i>`;
      this.loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      }, { once: true });
    } else {
      // User is not logged in
      this.loginLink.innerHTML = `<i class="fas fa-user"></i> Login`;
      this.loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.openLoginModal();
      }, { once: true });
    }
  }
  
  // Show message to user
  showMessage(message, type) {
    // Create message element with improved styling
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    let icon = '';
    switch(type) {
      case 'success':
        icon = '<i class="fas fa-check-circle"></i> ';
        break;
      case 'error':
        icon = '<i class="fas fa-exclamation-circle"></i> ';
        break;
      case 'info':
        icon = '<i class="fas fa-info-circle"></i> ';
        break;
      case 'warning':
        icon = '<i class="fas fa-exclamation-triangle"></i> ';
        break;
    }
    
    messageDiv.innerHTML = icon + message;
    
    // Style the message
    Object.assign(messageDiv.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: '9999',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      color: '#fff',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      transform: 'translateX(120%)',
      transition: 'transform 0.3s ease'
    });
    
    // Set background color based on type
    switch(type) {
      case 'success':
        messageDiv.style.backgroundColor = '#10b981';
        break;
      case 'error':
        messageDiv.style.backgroundColor = '#ef4444';
        break;
      case 'info':
        messageDiv.style.backgroundColor = '#3b82f6';
        break;
      case 'warning':
        messageDiv.style.backgroundColor = '#f59e0b';
        break;
    }
    
    // Add to DOM
    document.body.appendChild(messageDiv);
    
    // Animate in
    setTimeout(() => {
      messageDiv.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds with animation
    setTimeout(() => {
      messageDiv.style.transform = 'translateX(120%)';
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.parentNode.removeChild(messageDiv);
        }
      }, 300);
    }, 3000);
  }
  
  // Get current user
  getUser() {
    return this.user;
  }
  
  // Check if user is authenticated
  getIsAuthenticated() {
    return this.isAuthenticated;
  }
  
  // Get token for API calls
  getToken() {
    return this.token;
  }
}

// Initialize auth
const auth = new Auth(); 