// Cart class to handle shopping cart functionality
class Cart {
  constructor() {
    // Load cart from localStorage
    this.items = JSON.parse(localStorage.getItem('cart')) || [];
    this.total = 0;
    this.count = 0;
    
    // DOM Elements
    this.cartLink = document.getElementById('cart-link');
    this.cartModal = document.getElementById('cart-modal');
    this.closeCart = document.getElementById('close-cart');
    this.cartItems = document.getElementById('cart-items');
    this.cartTotal = document.getElementById('cart-total');
    this.cartCount = document.getElementById('cart-count');
    this.clearCartBtn = document.getElementById('clear-cart');
    this.checkoutBtn = document.getElementById('checkout-btn');
    
    // Initialize
    this.calculate();
    this.initialize();
  }
  
  // Initialize event listeners
  initialize() {
    // Open cart modal
    this.cartLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.openCartModal();
    });
    
    // Close cart modal
    this.closeCart.addEventListener('click', () => {
      this.closeCartModal();
    });
    
    // Clear cart
    this.clearCartBtn.addEventListener('click', () => {
      this.clearCart();
    });
    
    // Checkout
    this.checkoutBtn.addEventListener('click', () => {
      this.checkout();
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === this.cartModal) {
        this.closeCartModal();
      }
    });
  }
  
  // Calculate cart total and count
  calculate() {
    this.total = this.items.reduce((total, item) => total + item.price * item.quantity, 0);
    this.count = this.items.reduce((count, item) => count + item.quantity, 0);
    this.updateUI();
  }
  
  // Update UI
  updateUI() {
    // Update cart count
    this.cartCount.textContent = this.count;
    
    // Update cart total
    this.cartTotal.textContent = `$${this.total.toFixed(2)}`;
    
    // Update cart items display
    this.renderCartItems();
  }
  
  // Render cart items
  renderCartItems() {
    if (this.items.length === 0) {
      this.cartItems.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
      return;
    }
    
    this.cartItems.innerHTML = '';
    
    this.items.forEach(item => {
      const cartItemEl = document.createElement('div');
      cartItemEl.className = 'cart-item';
      cartItemEl.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.name}</h4>
          <p class="cart-item-price">$${item.price.toFixed(2)}</p>
        </div>
        <div class="cart-item-quantity">
          <button class="qty-btn decrease" data-id="${item.id}">-</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn increase" data-id="${item.id}">+</button>
        </div>
        <button class="cart-item-remove" data-id="${item.id}">
          <i class="fas fa-trash"></i>
        </button>
      `;
      
      this.cartItems.appendChild(cartItemEl);
    });
    
    // Add event listeners to quantity and remove buttons
    this.cartItems.querySelectorAll('.increase').forEach(btn => {
      btn.addEventListener('click', () => {
        this.increaseQuantity(parseInt(btn.dataset.id));
      });
    });
    
    this.cartItems.querySelectorAll('.decrease').forEach(btn => {
      btn.addEventListener('click', () => {
        this.decreaseQuantity(parseInt(btn.dataset.id));
      });
    });
    
    this.cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        this.removeItem(parseInt(btn.dataset.id));
      });
    });
  }
  
  // Open cart modal
  openCartModal() {
    this.cartModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }
  
  // Close cart modal
  closeCartModal() {
    this.cartModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  }
  
  // Add item to cart
  addItem(product, quantity = 1) {
    const existingItemIndex = this.items.findIndex(item => item.id === product.id);
    
    if (existingItemIndex !== -1) {
      // Item already exists, increase quantity
      this.items[existingItemIndex].quantity += quantity;
    } else {
      // New item, add to cart
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
    }
    
    // Save to localStorage and update UI
    this.saveCart();
    this.calculate();
    
    // Show success message
    this.showMessage(`${product.name} added to cart!`, 'success');
  }
  
  // Remove item from cart
  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    
    // Save to localStorage and update UI
    this.saveCart();
    this.calculate();
    
    // Show success message
    this.showMessage('Item removed from cart', 'success');
  }
  
  // Increase item quantity
  increaseQuantity(id) {
    const item = this.items.find(item => item.id === id);
    if (item) {
      item.quantity++;
      
      // Save to localStorage and update UI
      this.saveCart();
      this.calculate();
    }
  }
  
  // Decrease item quantity
  decreaseQuantity(id) {
    const item = this.items.find(item => item.id === id);
    if (item) {
      item.quantity--;
      
      if (item.quantity === 0) {
        // Remove item if quantity is 0
        this.removeItem(id);
      } else {
        // Save to localStorage and update UI
        this.saveCart();
        this.calculate();
      }
    }
  }
  
  // Clear cart
  clearCart() {
    this.items = [];
    
    // Save to localStorage and update UI
    this.saveCart();
    this.calculate();
    
    // Show success message
    this.showMessage('Cart cleared', 'success');
  }
  
  // Save cart to localStorage
  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }
  
  // Checkout process
  checkout() {
    // Close cart modal
    this.closeCartModal();
    
    // Check if user is authenticated
    if (!auth.getIsAuthenticated()) {
      // Prompt user to login
      auth.openLoginModal();
      auth.showMessage('Please login to checkout', 'info');
      return;
    }
    
    // Check if cart is empty
    if (this.items.length === 0) {
      this.showMessage('Your cart is empty', 'error');
      return;
    }
    
    // Open checkout modal
    const checkoutModal = document.getElementById('checkout-modal');
    checkoutModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }
  
  // Show message to user
  showMessage(message, type) {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Add to DOM
    document.body.appendChild(messageDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }
  
  // Get cart items
  getItems() {
    return this.items;
  }
  
  // Get cart total
  getTotal() {
    return this.total;
  }
  
  // Get cart count
  getCount() {
    return this.count;
  }
}

// Initialize cart
const cart = new Cart(); 