// Checkout class to handle checkout process
class Checkout {
  constructor() {
    // DOM Elements
    this.checkoutModal = document.getElementById('checkout-modal');
    this.closeCheckout = document.getElementById('close-checkout');
    this.steps = document.querySelectorAll('.step');
    this.stepContents = document.querySelectorAll('.step-content');
    this.shippingForm = document.getElementById('shipping-form');
    this.paymentForm = document.getElementById('payment-form');
    this.backToShippingBtn = document.getElementById('back-to-shipping');
    this.backToPaymentBtn = document.getElementById('back-to-payment');
    this.placeOrderBtn = document.getElementById('place-order');
    this.orderItems = document.getElementById('order-items');
    this.reviewShipping = document.getElementById('review-shipping');
    this.reviewPayment = document.getElementById('review-payment');
    this.reviewSubtotal = document.getElementById('review-subtotal');
    this.reviewShippingCost = document.getElementById('review-shipping-cost');
    this.reviewTax = document.getElementById('review-tax');
    this.reviewTotal = document.getElementById('review-total');
    this.orderSuccessModal = document.getElementById('order-success-modal');
    this.closeSuccess = document.getElementById('close-success');
    this.orderNumber = document.getElementById('order-number');
    this.continueShopping = document.getElementById('continue-shopping');
    
    // Customer data
    this.customer = {
      shipping: {},
      payment: {}
    };
    
    // Order data
    this.order = {
      items: [],
      subtotal: 0,
      shippingCost: 0,
      tax: 0,
      total: 0
    };
    
    // Current step
    this.currentStep = 1;
    
    // Initialize checkout
    this.initialize();
  }
  
  // Initialize event listeners
  initialize() {
    // Close checkout modal
    this.closeCheckout.addEventListener('click', () => {
      this.closeCheckoutModal();
    });
    
    // Close when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === this.checkoutModal) {
        this.closeCheckoutModal();
      }
      if (e.target === this.orderSuccessModal) {
        this.closeSuccessModal();
      }
    });
    
    // Shipping form submission
    this.shippingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveShippingInfo();
      this.goToStep(2);
    });
    
    // Payment form submission
    this.paymentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.savePaymentInfo();
      this.goToStep(3);
      this.updateOrderReview();
    });
    
    // Back to shipping
    this.backToShippingBtn.addEventListener('click', () => {
      this.goToStep(1);
    });
    
    // Back to payment
    this.backToPaymentBtn.addEventListener('click', () => {
      this.goToStep(2);
    });
    
    // Place order
    this.placeOrderBtn.addEventListener('click', () => {
      this.placeOrder();
    });
    
    // Close success modal
    this.closeSuccess.addEventListener('click', () => {
      this.closeSuccessModal();
    });
    
    // Continue shopping
    this.continueShopping.addEventListener('click', () => {
      this.closeSuccessModal();
      window.scrollTo(0, 0);
    });
  }
  
  // Open checkout modal
  openCheckoutModal() {
    this.checkoutModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Reset to first step
    this.goToStep(1);
    
    // Pre-fill form if user is logged in
    if (auth.getIsAuthenticated()) {
      const user = auth.getUser();
      if (user) {
        document.getElementById('full-name').value = user.name || '';
        document.getElementById('email').value = user.email || '';
      }
    }
  }
  
  // Close checkout modal
  closeCheckoutModal() {
    this.checkoutModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  }
  
  // Change step
  goToStep(step) {
    this.currentStep = step;
    
    // Update steps UI
    this.steps.forEach(s => {
      s.classList.remove('active');
      if (parseInt(s.dataset.step) <= step) {
        s.classList.add('active');
      }
    });
    
    // Update step content
    this.stepContents.forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`step-${step}`).classList.add('active');
  }
  
  // Save shipping information
  saveShippingInfo() {
    this.customer.shipping = {
      fullName: document.getElementById('full-name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      zip: document.getElementById('zip').value,
      country: document.getElementById('country').value
    };
  }
  
  // Save payment information
  savePaymentInfo() {
    // In a real app, you would use a secure payment processor and not store card details
    this.customer.payment = {
      cardName: document.getElementById('card-name').value,
      cardNumber: document.getElementById('card-number').value.replace(/\s/g, ''),
      cardExpiry: document.getElementById('expiry').value,
      cardCvv: document.getElementById('cvv').value
    };
  }
  
  // Update order review
  updateOrderReview() {
    // Get cart items and totals
    const cartItems = cart.getItems();
    const subtotal = cart.getTotal();
    
    // Calculate shipping cost
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST.standard;
    
    // Calculate tax
    const tax = subtotal * TAX_RATE;
    
    // Calculate total
    const total = subtotal + shippingCost + tax;
    
    // Save order data
    this.order.items = [...cartItems];
    this.order.subtotal = subtotal;
    this.order.shippingCost = shippingCost;
    this.order.tax = tax;
    this.order.total = total;
    
    // Display order items
    let itemsHTML = '';
    cartItems.forEach(item => {
      itemsHTML += `
        <div class="order-item">
          <img src="${item.image}" alt="${item.name}" class="order-item-img">
          <div class="order-item-details">
            <h4 class="order-item-title">${item.name}</h4>
            <div class="order-item-info">
              <span>Quantity: ${item.quantity}</span>
              <span>Price: $${item.price.toFixed(2)}</span>
              <span>Total: $${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          </div>
        </div>
      `;
    });
    
    this.orderItems.innerHTML = itemsHTML;
    
    // Display shipping details
    this.reviewShipping.innerHTML = `
      <h4>Shipping Address</h4>
      <div class="detail-item">
        <span class="detail-label">Name:</span>
        <span>${this.customer.shipping.fullName}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Email:</span>
        <span>${this.customer.shipping.email}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Phone:</span>
        <span>${this.customer.shipping.phone}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Address:</span>
        <span>${this.customer.shipping.address}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">City:</span>
        <span>${this.customer.shipping.city}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">State/Province:</span>
        <span>${this.customer.shipping.state}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">ZIP Code:</span>
        <span>${this.customer.shipping.zip}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Country:</span>
        <span>${this.customer.shipping.country}</span>
      </div>
    `;
    
    // Display payment details (masked for security)
    const maskedCardNumber = 'XXXX XXXX XXXX ' + this.customer.payment.cardNumber.slice(-4);
    
    this.reviewPayment.innerHTML = `
      <h4>Payment Method</h4>
      <div class="detail-item">
        <span class="detail-label">Card:</span>
        <span>${maskedCardNumber}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Name on Card:</span>
        <span>${this.customer.payment.cardName}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Expiry:</span>
        <span>${this.customer.payment.cardExpiry}</span>
      </div>
    `;
    
    // Display totals
    this.reviewSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    this.reviewShippingCost.textContent = shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`;
    this.reviewTax.textContent = `$${tax.toFixed(2)}`;
    this.reviewTotal.textContent = `$${total.toFixed(2)}`;
  }
  
  // Place order
  placeOrder() {
    // Generate random order number
    const orderNum = 'ECO-' + Math.floor(100000 + Math.random() * 900000);
    this.orderNumber.textContent = orderNum;
    
    // Close checkout modal
    this.closeCheckoutModal();
    
    // Clear cart
    cart.clearCart();
    
    // Show success modal
    this.orderSuccessModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }
  
  // Close success modal
  closeSuccessModal() {
    this.orderSuccessModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  }
}

// Initialize checkout when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.checkout = new Checkout();
}); 