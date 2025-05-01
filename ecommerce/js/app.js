// Main app initialization
document.addEventListener('DOMContentLoaded', () => {
  // Add global styles for messages
  addMessageStyles();
  
  // Initialize mobile menu
  initMobileMenu();
  
  // Add additional CSS for specific UI components
  addAdditionalStyles();
  
  // Fix for Checkout (already initialized in checkout.js)
  if (typeof window.checkout === 'undefined') {
    window.checkout = new Checkout();
  }
});

// Initialize mobile menu
function initMobileMenu() {
  const navbarToggle = document.querySelector('.navbar-toggle');
  const navbarNav = document.querySelector('.navbar-nav');
  
  navbarToggle.addEventListener('click', () => {
    navbarNav.classList.toggle('active');
    navbarToggle.classList.toggle('active');
  });
  
  // Close mobile menu when clicking on a link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navbarNav.classList.remove('active');
      navbarToggle.classList.remove('active');
    });
  });
}

// Add styles for message notifications
function addMessageStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .message {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      border-radius: 4px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      animation: slideInRight 0.3s ease, fadeOut 0.5s ease 2.5s forwards;
    }
    
    .message.success {
      background-color: var(--success-color);
    }
    
    .message.error {
      background-color: var(--danger-color);
    }
    
    .message.info {
      background-color: var(--info-color);
    }
    
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
    
    .navbar-toggle.active .bar:nth-child(1) {
      transform: rotate(-45deg) translate(-5px, 6px);
    }
    
    .navbar-toggle.active .bar:nth-child(2) {
      opacity: 0;
    }
    
    .navbar-toggle.active .bar:nth-child(3) {
      transform: rotate(45deg) translate(-5px, -6px);
    }
  `;
  
  document.head.appendChild(style);
}

// Add additional styles for specific UI components
function addAdditionalStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Additional product modal styles */
    .product-modal-content {
      display: flex;
      flex-direction: column;
      max-width: 800px;
    }
    
    .product-modal-body {
      padding: 0;
    }
    
    .product-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    
    .product-modal-image {
      height: 400px;
    }
    
    .product-modal-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }
    
    .product-modal-info {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .product-modal-title {
      font-size: 1.8rem;
      margin-bottom: 0.5rem;
    }
    
    .product-modal-category {
      color: #666;
      margin-bottom: 1rem;
    }
    
    .product-modal-price {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 1rem;
    }
    
    .product-modal-rating {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .product-modal-rating .stars {
      margin-right: 0.5rem;
    }
    
    .product-modal-description {
      margin-bottom: 1rem;
    }
    
    .product-modal-description h3 {
      margin-bottom: 0.5rem;
    }
    
    .product-modal-stock {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    
    .in-stock {
      color: var(--success-color);
    }
    
    .out-of-stock {
      color: var(--danger-color);
    }
    
    .product-modal-quantity {
      margin-bottom: 1rem;
    }
    
    .quantity-control {
      display: flex;
      align-items: center;
      margin-top: 0.5rem;
    }
    
    .quantity-control input {
      width: 60px;
      text-align: center;
      margin: 0 0.5rem;
    }
    
    /* Order success modal */
    .success-icon i {
      font-size: 5rem;
      color: var(--success-color);
    }
    
    .text-center {
      text-align: center;
    }
    
    /* Responsive styles for smaller screens */
    @media (max-width: 768px) {
      .product-details {
        grid-template-columns: 1fr;
      }
      
      .product-modal-image {
        height: 300px;
      }
    }
  `;
  
  document.head.appendChild(style);
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    
    // Check if it's not a modal link
    if (!this.id.includes('link')) {
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
}); 