// Menu Data
const menuItems = [
    {
        id: 1,
        name: 'Truffle Risotto',
        description: 'Creamy Arborio rice with black truffle and parmesan',
        price: 24.99,
        category: 'main',
        image: 'https://source.unsplash.com/random/400x300/?risotto'
    },
    {
        id: 2,
        name: 'Bruschetta',
        description: 'Toasted bread with fresh tomatoes, basil, and garlic',
        price: 8.99,
        category: 'starters',
        image: 'https://source.unsplash.com/random/400x300/?bruschetta'
    },
    {
        id: 3,
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee-soaked ladyfingers',
        price: 12.99,
        category: 'desserts',
        image: 'https://source.unsplash.com/random/400x300/?tiramisu'
    },
    {
        id: 4,
        name: 'Signature Martini',
        description: 'House special with premium vodka and dry vermouth',
        price: 14.99,
        category: 'drinks',
        image: 'https://source.unsplash.com/random/400x300/?martini'
    }
];

// Testimonials Data
const testimonials = [
    {
        id: 1,
        name: 'John Smith',
        rating: 5,
        comment: 'An exceptional dining experience. The food was exquisite and the service was impeccable.',
        image: 'https://source.unsplash.com/random/100x100/?portrait'
    },
    {
        id: 2,
        name: 'Sarah Johnson',
        rating: 5,
        comment: 'The ambiance is perfect for a romantic dinner. The wine selection is outstanding.',
        image: 'https://source.unsplash.com/random/100x100/?woman'
    },
    {
        id: 3,
        name: 'Michael Brown',
        rating: 4,
        comment: 'Great food and atmosphere. The staff is very attentive and professional.',
        image: 'https://source.unsplash.com/random/100x100/?man'
    }
];

// Events Data
const events = [
    {
        id: 1,
        title: 'Wine Tasting Evening',
        date: 'June 15, 2024',
        description: 'Join us for an evening of fine wines and gourmet pairings.',
        image: 'https://source.unsplash.com/random/400x300/?wine-tasting'
    },
    {
        id: 2,
        title: 'Chef\'s Table Experience',
        date: 'June 22, 2024',
        description: 'An exclusive dining experience with our head chef.',
        image: 'https://source.unsplash.com/random/400x300/?chef'
    },
    {
        id: 3,
        title: 'Live Jazz Night',
        date: 'June 29, 2024',
        description: 'Enjoy live jazz music while dining with us.',
        image: 'https://source.unsplash.com/random/400x300/?jazz'
    }
];

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
    initializeMenu();
    initializeTestimonials();
    initializeEvents();
    initializeForm();
    initializeGallery();
});

// Menu Functions
function initializeMenu() {
    const menuGrid = document.querySelector('.menu-items');
    const filterButtons = document.querySelectorAll('.category-btn');

    // Load menu items
    function loadMenuItems(category = 'all') {
        menuGrid.innerHTML = '';
        const filteredItems = category === 'all' 
            ? menuItems 
            : menuItems.filter(item => item.category === category);

        filteredItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.innerHTML = `
                <div class="menu-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="menu-item-details">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <span class="price">$${item.price.toFixed(2)}</span>
                </div>
            `;
            menuGrid.appendChild(menuItem);
        });
    }

    // Initialize with all items
    loadMenuItems();

    // Add click event to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Load filtered items
            loadMenuItems(category);
        });
    });
}

// Testimonials Functions
function initializeTestimonials() {
    const slider = document.querySelector('.testimonials-slider');
    let currentTestimonial = 0;

    // Load testimonials
    function loadTestimonials() {
        slider.innerHTML = '';
        testimonials.forEach((testimonial, index) => {
            const testimonialElement = document.createElement('div');
            testimonialElement.className = `testimonial ${index === currentTestimonial ? 'active' : ''}`;
            testimonialElement.innerHTML = `
                <div class="testimonial-content">
                    <p>${testimonial.comment}</p>
                    <div class="testimonial-author">
                        <img src="${testimonial.image}" alt="${testimonial.name}">
                        <div class="author-info">
                            <h4>${testimonial.name}</h4>
                            <div class="rating">${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}</div>
                        </div>
                    </div>
                </div>
            `;
            slider.appendChild(testimonialElement);
        });
    }

    // Initialize testimonials
    loadTestimonials();

    // Auto-rotate testimonials
    setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        loadTestimonials();
    }, 5000);
}

// Events Functions
function initializeEvents() {
    const eventsGrid = document.querySelector('.events-grid');

    // Load events
    events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.innerHTML = `
            <div class="event-image">
                <img src="${event.image}" alt="${event.title}">
            </div>
            <div class="event-details">
                <h3>${event.title}</h3>
                <p class="event-date">${event.date}</p>
                <p class="event-description">${event.description}</p>
                <button class="btn secondary">Book Now</button>
            </div>
        `;
        eventsGrid.appendChild(eventCard);
    });
}

// Form Functions
function initializeForm() {
    const form = document.getElementById('reservation-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Basic validation
        if (!data.name || !data.email || !data.phone || !data.date || !data.time || !data.guests) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success message
            showNotification('Reservation request sent! We will confirm shortly.', 'success');
            form.reset();
        } catch (error) {
            showNotification('Something went wrong. Please try again.', 'error');
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

// Gallery Functions
function initializeGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.querySelector('img').style.transform = 'scale(1.1)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.querySelector('img').style.transform = 'scale(1)';
        });
        
        // Add click event for lightbox
        item.addEventListener('click', () => {
            const imgSrc = item.querySelector('img').src;
            openLightbox(imgSrc);
        });
    });
}

function openLightbox(imgSrc) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <img src="${imgSrc}" alt="Gallery Image">
            <button class="lightbox-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';
    
    // Show lightbox with animation
    setTimeout(() => {
        lightbox.classList.add('show');
    }, 100);
    
    // Close lightbox on click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.className === 'lightbox-close') {
            lightbox.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(lightbox);
                document.body.style.overflow = '';
            }, 300);
        }
    });
}

// Utility Functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Mobile Menu Toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('show');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('show');
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu after clicking a link
            navLinks.classList.remove('show');
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.classList.remove('scrolled');
        return;
    }
    
    if (currentScroll > lastScroll) {
        // Scrolling down
        navbar.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        navbar.style.transform = 'translateY(0)';
        navbar.classList.add('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Menu category filtering
const categoryButtons = document.querySelectorAll('.category-btn');
const menuItems = document.querySelectorAll('.menu-item');

categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');
        
        const category = button.dataset.category;
        
        menuItems.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 100);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    });
});

// Add CSS for notifications and lightbox
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 8px;
        background: white;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 1000;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification.success {
        border-left: 4px solid var(--success-color);
    }
    
    .notification.error {
        border-left: 4px solid var(--accent-color);
    }
    
    .lightbox {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1000;
    }
    
    .lightbox.show {
        opacity: 1;
    }
    
    .lightbox-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
    }
    
    .lightbox-content img {
        max-width: 100%;
        max-height: 90vh;
        object-fit: contain;
    }
    
    .lightbox-close {
        position: absolute;
        top: -40px;
        right: 0;
        background: none;
        border: none;
        color: white;
        font-size: 2rem;
        cursor: pointer;
    }
`;

document.head.appendChild(style);

// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 800,
    once: true,
    offset: 100
});

// Add parallax effect to hero section
const hero = document.querySelector('.hero');
window.addEventListener('scroll', () => {
    const scroll = window.pageYOffset;
    hero.style.backgroundPositionY = `${scroll * 0.5}px`;
});

// Add hover effect to menu items
menuItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.transform = 'translateY(-10px)';
    });
    
    item.addEventListener('mouseleave', () => {
        item.style.transform = 'translateY(0)';
    });
}); 