// Products class to handle product display and filtering
class Products {
  constructor() {
    // Store all products and filtered products
    this.allProducts = products; // from data.js
    this.filteredProducts = [...this.allProducts];
    this.currentFilter = 'all';
    this.currentSort = 'featured';
    
    // DOM Elements
    this.productsContainer = document.getElementById('products-container');
    this.filterBtns = document.querySelectorAll('.filter-btn');
    this.sortSelect = document.getElementById('sort');
    this.productModal = document.getElementById('product-modal');
    this.closeProduct = document.getElementById('close-product');
    this.productDetails = document.querySelector('.product-details');
    
    // Initialize
    this.initialize();
  }
  
  // Initialize event listeners
  initialize() {
    // Load products
    this.renderProducts();
    
    // Filter buttons click event
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active class
        this.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Filter products
        this.currentFilter = btn.dataset.filter;
        this.filterProducts();
      });
    });
    
    // Sort select change event
    this.sortSelect.addEventListener('change', () => {
      this.currentSort = this.sortSelect.value;
      this.sortProducts();
    });
    
    // Close product modal
    this.closeProduct.addEventListener('click', () => {
      this.closeProductModal();
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === this.productModal) {
        this.closeProductModal();
      }
    });
  }
  
  // Filter products by category
  filterProducts() {
    if (this.currentFilter === 'all') {
      this.filteredProducts = [...this.allProducts];
    } else {
      this.filteredProducts = this.allProducts.filter(
        product => product.category === this.currentFilter
      );
    }
    
    // Apply current sort
    this.sortProducts(false);
    
    // Render filtered products
    this.renderProducts();
  }
  
  // Sort products
  sortProducts(render = true) {
    switch (this.currentSort) {
      case 'price-low':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        this.filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      default: // 'featured'
        this.filteredProducts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }
    
    if (render) {
      this.renderProducts();
    }
  }
  
  // Render products to DOM
  renderProducts() {
    // Remove loader if present
    const loader = this.productsContainer.querySelector('.product-loader');
    if (loader) {
      loader.remove();
    }
    
    // Show message if no products
    if (this.filteredProducts.length === 0) {
      this.productsContainer.innerHTML = `
        <div class="no-products">
          <p>No products found in this category.</p>
          <button class="btn btn-primary" id="view-all-btn">View All Products</button>
        </div>
      `;
      
      // Add event listener to view all button
      document.getElementById('view-all-btn').addEventListener('click', () => {
        this.filterBtns.forEach(btn => {
          if (btn.dataset.filter === 'all') {
            btn.click();
          }
        });
      });
      
      return;
    }
    
    // Create product cards
    let productsHTML = '';
    
    this.filteredProducts.forEach(product => {
      // Generate stars based on rating
      const fullStars = Math.floor(product.rating);
      const halfStar = product.rating % 1 >= 0.5 ? 1 : 0;
      const emptyStars = 5 - fullStars - halfStar;
      
      const stars = '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
      
      productsHTML += `
        <div class="product-card" data-id="${product.id}">
          ${product.featured ? '<span class="product-badge">Featured</span>' : ''}
          <div class="product-image">
            <img src="${product.image}" alt="${product.name}">
          </div>
          <div class="product-info">
            <div class="product-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</div>
            <h3 class="product-title">${product.name}</h3>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="product-rating">
              <span class="stars">${stars}</span>
              <span>(${product.reviews})</span>
            </div>
            <div class="product-action">
              <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
              <button class="view-details" data-id="${product.id}">Details</button>
            </div>
          </div>
        </div>
      `;
    });
    
    this.productsContainer.innerHTML = productsHTML;
    
    // Add event listeners to buttons
    this.addEventListeners();
  }
  
  // Add event listeners to product buttons
  addEventListeners() {
    // Add to cart buttons
    this.productsContainer.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const product = this.allProducts.find(p => p.id === id);
        
        if (product) {
          cart.addItem(product, 1);
        }
      });
    });
    
    // View details buttons
    this.productsContainer.querySelectorAll('.view-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        this.showProductDetails(id);
      });
    });
    
    // Click on product card
    this.productsContainer.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id);
        this.showProductDetails(id);
      });
    });
  }
  
  // Show product details in modal
  showProductDetails(id) {
    const product = this.allProducts.find(p => p.id === id);
    
    if (!product) return;
    
    // Generate stars based on rating
    const fullStars = Math.floor(product.rating);
    const halfStar = product.rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    const stars = '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
    
    // Update modal content
    this.productDetails.innerHTML = `
      <div class="product-modal-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-modal-info">
        <h2 class="product-modal-title">${product.name}</h2>
        <div class="product-modal-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</div>
        <div class="product-modal-price">$${product.price.toFixed(2)}</div>
        <div class="product-modal-rating">
          <span class="stars">${stars}</span>
          <span>(${product.reviews} reviews)</span>
        </div>
        <div class="product-modal-description">
          <h3>Description</h3>
          <p>${product.description}</p>
        </div>
        <div class="product-modal-stock">
          <span>Availability:</span>
          <span class="${product.inStock > 0 ? 'in-stock' : 'out-of-stock'}">
            ${product.inStock > 0 ? `In Stock (${product.inStock} left)` : 'Out of Stock'}
          </span>
        </div>
        <div class="product-modal-quantity">
          <label for="product-quantity">Quantity:</label>
          <div class="quantity-control">
            <button class="qty-btn decrease" id="decrease-quantity">-</button>
            <input type="number" id="product-quantity" value="1" min="1" max="${product.inStock}">
            <button class="qty-btn increase" id="increase-quantity">+</button>
          </div>
        </div>
        <div class="product-modal-action">
          <button class="btn btn-primary btn-block" id="add-to-cart-modal" ${product.inStock === 0 ? 'disabled' : ''}>
            ${product.inStock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    `;
    
    // Update modal title
    document.getElementById('product-modal-title').textContent = product.name;
    
    // Open modal
    this.openProductModal();
    
    // Add event listeners
    const quantityInput = document.getElementById('product-quantity');
    const decreaseBtn = document.getElementById('decrease-quantity');
    const increaseBtn = document.getElementById('increase-quantity');
    const addToCartBtn = document.getElementById('add-to-cart-modal');
    
    decreaseBtn.addEventListener('click', () => {
      let value = parseInt(quantityInput.value);
      if (value > 1) {
        quantityInput.value = value - 1;
      }
    });
    
    increaseBtn.addEventListener('click', () => {
      let value = parseInt(quantityInput.value);
      if (value < product.inStock) {
        quantityInput.value = value + 1;
      }
    });
    
    quantityInput.addEventListener('change', () => {
      let value = parseInt(quantityInput.value);
      if (value < 1) {
        quantityInput.value = 1;
      } else if (value > product.inStock) {
        quantityInput.value = product.inStock;
      }
    });
    
    addToCartBtn.addEventListener('click', () => {
      const quantity = parseInt(quantityInput.value);
      cart.addItem(product, quantity);
      this.closeProductModal();
    });
  }
  
  // Open product modal
  openProductModal() {
    this.productModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }
  
  // Close product modal
  closeProductModal() {
    this.productModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  }
  
  // Get filtered products
  getFilteredProducts() {
    return this.filteredProducts;
  }
  
  // Get product by ID
  getProductById(id) {
    return this.allProducts.find(product => product.id === id);
  }
}

// Initialize products
const productsManager = new Products(); 