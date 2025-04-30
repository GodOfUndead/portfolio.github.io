# EcoShop - Sustainable Products E-commerce Website

A modern, responsive e-commerce website for sustainable and eco-friendly products. Built with HTML, CSS, and vanilla JavaScript.

## Features

- **Product Catalog**: Browse a curated collection of sustainable products
- **Category Filtering**: Filter products by category (Eco, Tech, Fashion)
- **Sorting Options**: Sort products by price, rating, or featured status
- **Shopping Cart**: Add, update quantity, or remove items from cart
- **User Authentication**: Register and login functionality
- **Detailed Product View**: View detailed product information in a modal
- **Checkout Process**: Multi-step checkout with shipping and payment information
- **Order Confirmation**: Receive confirmation after successful order placement
- **Responsive Design**: Works on all devices from mobile to desktop

## Technologies Used

- HTML5
- CSS3 (with CSS Variables)
- Vanilla JavaScript (ES6+)
- LocalStorage for data persistence
- Font Awesome for icons

## Project Structure

```
ecommerce/
├── css/
│   └── style.css             # Main stylesheet
├── js/
│   ├── app.js                # Main application file
│   ├── auth.js               # Authentication functionality
│   ├── cart.js               # Shopping cart functionality
│   ├── checkout.js           # Checkout process
│   ├── data.js               # Product data
│   └── products.js           # Product display and filtering
├── images/                   # Product images (loaded from URLs)
└── index.html                # Main HTML file
```

## How to Use

1. Clone or download this repository
2. Open `index.html` in your browser
3. Browse the product catalog
4. Add items to your cart
5. Proceed to checkout
6. Fill in the shipping and payment information
7. Place your order

## Demo Data

The application uses demo data stored in `data.js`. In a real-world scenario, this would be replaced with a backend API.

For demonstration purposes:
- Any email/password combination will work for login
- Payment processing is simulated
- Orders are not actually processed

## Future Improvements

- Add a backend API with Node.js and Express
- Implement a database with MongoDB
- Add real payment processing with Stripe
- Implement product search functionality
- Add product reviews and ratings
- Enable product filtering by price range
- Add product wishlist functionality
- Implement a CMS for product management

## Credits

- Product images from [Unsplash](https://unsplash.com/)
- Icons from [Font Awesome](https://fontawesome.com/)
- Fonts from [Google Fonts](https://fonts.google.com/) 