// Product data
const products = [
  {
    id: 1,
    name: "Eco-Friendly Water Bottle",
    price: 29.99,
    description: "Reusable stainless steel water bottle that keeps beverages cold for 24 hours or hot for 12 hours. BPA-free and eco-friendly design.",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=500&q=60",
    category: "eco",
    rating: 4.8,
    reviews: 125,
    inStock: 50,
    featured: true
  },
  {
    id: 2,
    name: "Organic Cotton Tote Bag",
    price: 19.99,
    description: "Made from 100% organic cotton, this durable tote bag is perfect for shopping, beach trips, or daily use. Machine washable and plastic-free.",
    image: "https://images.unsplash.com/photo-1605438273549-1dfb95579854?auto=format&fit=crop&w=500&q=60",
    category: "eco",
    rating: 4.6,
    reviews: 89,
    inStock: 120,
    featured: true
  },
  {
    id: 3,
    name: "Bamboo Toothbrush Set",
    price: 12.99,
    description: "Pack of 4 biodegradable bamboo toothbrushes with BPA-free bristles. A plastic-free alternative for your daily oral care routine.",
    image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=500&q=60",
    category: "eco",
    rating: 4.5,
    reviews: 74,
    inStock: 200,
    featured: false
  },
  {
    id: 4,
    name: "Smart Fitness Tracker",
    price: 99.99,
    description: "Track your steps, heart rate, sleep patterns, and more with this waterproof fitness tracker. Features a 7-day battery life and smartphone notifications.",
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd6b0?auto=format&fit=crop&w=500&q=60",
    category: "tech",
    rating: 4.7,
    reviews: 210,
    inStock: 35,
    featured: true
  },
  {
    id: 5,
    name: "Wireless Earbuds",
    price: 129.99,
    description: "True wireless earbuds with noise cancellation, touch controls, and up to 30 hours of battery life with the charging case. Water and sweat resistant.",
    image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=500&q=60",
    category: "tech",
    rating: 4.9,
    reviews: 176,
    inStock: 25,
    featured: true
  },
  {
    id: 6,
    name: "Portable Solar Charger",
    price: 49.99,
    description: "Charge your devices on the go with this portable solar power bank. Features 2 USB outputs and is perfect for camping, hiking, or emergency use.",
    image: "https://images.unsplash.com/photo-1617705055275-80ad10247add?auto=format&fit=crop&w=500&q=60",
    category: "tech",
    rating: 4.2,
    reviews: 58,
    inStock: 40,
    featured: false
  },
  {
    id: 7,
    name: "Recycled Denim Jacket",
    price: 89.99,
    description: "Classic denim jacket made from recycled denim and organic cotton. Ethically manufactured with eco-friendly dyes.",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=500&q=60",
    category: "fashion",
    rating: 4.6,
    reviews: 63,
    inStock: 15,
    featured: true
  },
  {
    id: 8,
    name: "Sustainable Wool Sweater",
    price: 79.99,
    description: "Warm and cozy sweater made from ethically sourced wool. Features a classic design that never goes out of style.",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=500&q=60",
    category: "fashion",
    rating: 4.4,
    reviews: 42,
    inStock: 22,
    featured: false
  },
  {
    id: 9,
    name: "Vegan Leather Backpack",
    price: 69.99,
    description: "Stylish backpack made from high-quality vegan leather. Features multiple compartments, including a padded laptop sleeve.",
    image: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=500&q=60",
    category: "fashion",
    rating: 4.3,
    reviews: 87,
    inStock: 30,
    featured: true
  },
  {
    id: 10,
    name: "Reusable Food Wrap",
    price: 15.99,
    description: "Set of 3 reusable beeswax food wraps, a sustainable alternative to plastic wrap. Washable, biodegradable, and perfect for keeping food fresh.",
    image: "https://images.unsplash.com/photo-1611071535477-1748d6d3e762?auto=format&fit=crop&w=500&q=60",
    category: "eco",
    rating: 4.5,
    reviews: 114,
    inStock: 100,
    featured: false
  },
  {
    id: 11,
    name: "Eco-Friendly Phone Case",
    price: 24.99,
    description: "Biodegradable phone case made from wheat straw and recycled materials. Provides durable protection while reducing plastic waste.",
    image: "https://images.unsplash.com/photo-1623123095585-bbc6ee297424?auto=format&fit=crop&w=500&q=60",
    category: "tech",
    rating: 4.4,
    reviews: 93,
    inStock: 45,
    featured: false
  },
  {
    id: 12,
    name: "Bamboo Cutlery Set",
    price: 18.99,
    description: "Portable bamboo cutlery set including fork, knife, spoon, chopsticks, and straw with a carrying case. Perfect for reducing single-use plastic when dining out.",
    image: "https://images.unsplash.com/photo-1636553395794-79e7e4381361?auto=format&fit=crop&w=500&q=60",
    category: "eco",
    rating: 4.7,
    reviews: 67,
    inStock: 85,
    featured: false
  }
];

// Tax rate
const TAX_RATE = 0.08;

// Shipping costs
const SHIPPING_COST = {
  standard: 4.99,
  express: 12.99,
  free: 0
};

// Free shipping threshold
const FREE_SHIPPING_THRESHOLD = 50; 