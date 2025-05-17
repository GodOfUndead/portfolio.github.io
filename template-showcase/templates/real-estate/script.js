// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.createElement('div');
mobileMenu.className = 'mobile-menu';
mobileMenu.innerHTML = `
    <div class="close-menu">
        <i class="fas fa-times"></i>
    </div>
    <div class="nav-links">
        <a href="#home">Home</a>
        <a href="#properties">Properties</a>
        <a href="#agents">Agents</a>
        <a href="#calculator">Calculator</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
    </div>
`;
document.body.appendChild(mobileMenu);

menuToggle.addEventListener('click', () => {
    mobileMenu.classList.add('active');
});

mobileMenu.querySelector('.close-menu').addEventListener('click', () => {
    mobileMenu.classList.remove('active');
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            mobileMenu.classList.remove('active');
        }
    });
});

// Navbar Scroll Effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.classList.remove('scrolled');
        return;
    }
    
    if (currentScroll > lastScroll) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Enhanced Mortgage Calculator
const calculator = {
    homePrice: document.getElementById('homePrice'),
    downPayment: document.getElementById('downPayment'),
    interestRate: document.getElementById('interestRate'),
    loanTerm: document.getElementById('loanTerm'),
    calculate: document.getElementById('calculate'),
    monthlyPayment: document.getElementById('monthlyPayment'),
    totalInterest: document.getElementById('totalInterest'),
    totalPayment: document.getElementById('totalPayment')
};

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function calculateMortgage() {
    const principal = parseFloat(calculator.homePrice.value) - parseFloat(calculator.downPayment.value);
    const rate = parseFloat(calculator.interestRate.value) / 100 / 12;
    const term = parseInt(calculator.loanTerm.value) * 12;
    
    if (principal <= 0 || rate <= 0 || term <= 0) {
        alert('Please enter valid values for all fields');
        return;
    }
    
    const monthlyPayment = principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    const totalPayment = monthlyPayment * term;
    const totalInterest = totalPayment - principal;
    
    calculator.monthlyPayment.textContent = formatCurrency(monthlyPayment);
    calculator.totalInterest.textContent = formatCurrency(totalInterest);
    calculator.totalPayment.textContent = formatCurrency(totalPayment);
    
    // Add animation to results
    const results = document.querySelectorAll('.result-item p');
    results.forEach(result => {
        result.style.animation = 'none';
        result.offsetHeight; // Trigger reflow
        result.style.animation = 'fadeInUp 0.5s ease';
    });
}

// Real-time calculation as user types
['homePrice', 'downPayment', 'interestRate'].forEach(field => {
    calculator[field].addEventListener('input', () => {
        if (calculator[field].value) {
            calculateMortgage();
        }
    });
});

calculator.loanTerm.addEventListener('change', calculateMortgage);

// Property Card Hover Effects
const propertyCards = document.querySelectorAll('.property-card');

propertyCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Virtual Tour Buttons
const virtualTourButtons = document.querySelectorAll('.virtual-tour');

virtualTourButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Here you would typically open a virtual tour modal or redirect to a 360° view
        alert('Virtual tour feature coming soon!');
    });
});

// Contact Form Validation
const contactForm = document.querySelector('.contact-form');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // Here you would typically send the form data to a server
    console.log('Form submitted:', data);
    alert('Thank you for your message! We will get back to you soon.');
    contactForm.reset();
});

// Animate Elements on Scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.property-card, .agent-card, .feature-card');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        
        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// Image Loading Animation
const images = document.querySelectorAll('img');

images.forEach(img => {
    img.addEventListener('load', () => {
        img.classList.add('loaded');
    });
});

// Property Listing Filter
const filterButtons = document.querySelectorAll('.search-filters select');

filterButtons.forEach(button => {
    button.addEventListener('change', () => {
        // Here you would typically filter the property listings
        console.log('Filtering properties...');
    });
});

// Agent Contact Links
const agentContactLinks = document.querySelectorAll('.agent-contact a');

agentContactLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.getAttribute('href') === '#') {
            e.preventDefault();
            alert('Contact information will be available soon!');
        }
    });
});

// Enhanced Property Search
const searchForm = document.querySelector('.search-container');
const searchInput = searchForm.querySelector('input');
const propertyType = searchForm.querySelector('select:nth-of-type(1)');
const priceRange = searchForm.querySelector('select:nth-of-type(2)');
const bedrooms = searchForm.querySelector('select:nth-of-type(3)');

// Sample property data (in a real application, this would come from a database)
const properties = [
    {
        id: 1,
        title: 'Modern Family Home',
        type: 'house',
        price: 850000,
        beds: 4,
        baths: 3,
        sqft: 2500,
        location: '123 Dream Street, City',
        image: 'https://source.unsplash.com/random/400x300/?luxury-house',
        status: 'For Sale'
    },
    {
        id: 2,
        title: 'Downtown Apartment',
        type: 'apartment',
        price: 2500,
        beds: 2,
        baths: 2,
        sqft: 1200,
        location: '456 Urban Ave, City',
        image: 'https://source.unsplash.com/random/400x300/?apartment',
        status: 'For Rent'
    },
    {
        id: 3,
        title: 'Beachfront Villa',
        type: 'villa',
        price: 1200000,
        beds: 5,
        baths: 4,
        sqft: 3500,
        location: '789 Ocean Drive, City',
        image: 'https://source.unsplash.com/random/400x300/?villa',
        status: 'For Sale'
    }
];

function filterProperties() {
    const query = searchInput.value.toLowerCase();
    const type = propertyType.value;
    const price = priceRange.value;
    const beds = bedrooms.value;
    
    const filteredProperties = properties.filter(property => {
        const matchesQuery = property.title.toLowerCase().includes(query) ||
                           property.location.toLowerCase().includes(query);
        const matchesType = !type || property.type === type;
        const matchesBeds = !beds || property.beds >= parseInt(beds);
        
        let matchesPrice = true;
        if (price) {
            const [min, max] = price.split('-').map(p => parseInt(p.replace(/[^0-9]/g, '')));
            if (property.status === 'For Sale') {
                matchesPrice = property.price >= min && (!max || property.price <= max);
            } else {
                matchesPrice = property.price >= min && (!max || property.price <= max);
            }
        }
        
        return matchesQuery && matchesType && matchesPrice && matchesBeds;
    });
    
    displayProperties(filteredProperties);
}

function displayProperties(properties) {
    const propertiesGrid = document.querySelector('.properties-grid');
    propertiesGrid.innerHTML = properties.map(property => `
        <div class="property-card">
            <div class="property-image">
                <img src="${property.image}" alt="${property.title}">
                <div class="property-tag">${property.status}</div>
                <div class="property-price">${property.status === 'For Sale' ? 
                    formatCurrency(property.price) : 
                    formatCurrency(property.price) + '/mo'}</div>
            </div>
            <div class="property-info">
                <h3>${property.title}</h3>
                <p class="location"><i class="fas fa-map-marker-alt"></i> ${property.location}</p>
                <div class="property-features">
                    <span><i class="fas fa-bed"></i> ${property.beds} Beds</span>
                    <span><i class="fas fa-bath"></i> ${property.baths} Baths</span>
                    <span><i class="fas fa-ruler-combined"></i> ${property.sqft} sqft</span>
                </div>
                <div class="property-actions">
                    <button class="view-details" onclick="viewPropertyDetails(${property.id})">View Details</button>
                    <button class="virtual-tour" onclick="startVirtualTour(${property.id})">Virtual Tour</button>
                </div>
            </div>
        </div>
    `).join('');
}

function viewPropertyDetails(propertyId) {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
        // Create and show modal with property details
        const modal = document.createElement('div');
        modal.className = 'property-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>${property.title}</h2>
                <img src="${property.image}" alt="${property.title}">
                <div class="property-details">
                    <p><strong>Status:</strong> ${property.status}</p>
                    <p><strong>Price:</strong> ${property.status === 'For Sale' ? 
                        formatCurrency(property.price) : 
                        formatCurrency(property.price) + '/mo'}</p>
                    <p><strong>Location:</strong> ${property.location}</p>
                    <p><strong>Bedrooms:</strong> ${property.beds}</p>
                    <p><strong>Bathrooms:</strong> ${property.baths}</p>
                    <p><strong>Square Footage:</strong> ${property.sqft}</p>
                </div>
                <button class="contact-agent" onclick="contactAgent(${propertyId})">Contact Agent</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .property-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .modal-content {
                background: white;
                padding: 2rem;
                border-radius: 10px;
                max-width: 800px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
            }
            .close-modal {
                position: absolute;
                top: 1rem;
                right: 1rem;
                font-size: 1.5rem;
                cursor: pointer;
            }
            .property-details {
                margin: 1rem 0;
            }
            .contact-agent {
                background: var(--secondary-color);
                color: white;
                border: none;
                padding: 0.8rem 1.5rem;
                border-radius: 5px;
                cursor: pointer;
                transition: var(--transition);
            }
            .contact-agent:hover {
                background: #2980b9;
            }
        `;
        document.head.appendChild(style);
        
        // Close modal functionality
        modal.querySelector('.close-modal').onclick = () => {
            modal.remove();
            style.remove();
        };
    }
}

function startVirtualTour(propertyId) {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
        // Create and show virtual tour modal
        const modal = document.createElement('div');
        modal.className = 'virtual-tour-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Virtual Tour - ${property.title}</h2>
                <div class="virtual-tour-container">
                    <iframe src="https://my.matterport.com/show/?m=YOUR_MATTERPORT_ID" 
                            frameborder="0" 
                            allowfullscreen 
                            allow="vr">
                    </iframe>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .virtual-tour-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .virtual-tour-container {
                width: 100%;
                height: 80vh;
            }
            .virtual-tour-container iframe {
                width: 100%;
                height: 100%;
            }
        `;
        document.head.appendChild(style);
        
        // Close modal functionality
        modal.querySelector('.close-modal').onclick = () => {
            modal.remove();
            style.remove();
        };
    }
}

function contactAgent(propertyId) {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
        // Show contact form modal
        const modal = document.createElement('div');
        modal.className = 'contact-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Contact Agent</h2>
                <form class="agent-contact-form">
                    <input type="text" placeholder="Your Name" required>
                    <input type="email" placeholder="Your Email" required>
                    <input type="tel" placeholder="Phone Number" required>
                    <textarea placeholder="Your Message" required></textarea>
                    <button type="submit">Send Message</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .contact-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .agent-contact-form {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            .agent-contact-form input,
            .agent-contact-form textarea {
                padding: 0.8rem;
                border: 1px solid #ddd;
                border-radius: 5px;
            }
            .agent-contact-form textarea {
                height: 150px;
                resize: vertical;
            }
            .agent-contact-form button {
                background: var(--secondary-color);
                color: white;
                border: none;
                padding: 1rem;
                border-radius: 5px;
                cursor: pointer;
                transition: var(--transition);
            }
            .agent-contact-form button:hover {
                background: #2980b9;
            }
        `;
        document.head.appendChild(style);
        
        // Form submission
        const form = modal.querySelector('.agent-contact-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            alert('Thank you for your interest! An agent will contact you shortly.');
            modal.remove();
            style.remove();
        };
        
        // Close modal functionality
        modal.querySelector('.close-modal').onclick = () => {
            modal.remove();
            style.remove();
        };
    }
}

// Initialize property search
searchInput.addEventListener('input', filterProperties);
propertyType.addEventListener('change', filterProperties);
priceRange.addEventListener('change', filterProperties);
bedrooms.addEventListener('change', filterProperties);

// Initial property display
displayProperties(properties);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set initial styles for animation
    document.querySelectorAll('.property-card, .agent-card, .feature-card').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.5s ease';
    });
    
    // Calculate initial mortgage
    calculateMortgage();
});

// Navbar Scroll Effect
const navbar = document.querySelector('.premium-navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.style.display = 'none';
    }
});

// Smooth Scrolling for Navigation Links
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
            navLinks.style.display = 'none';
        }
    });
});

// Property Card Hover Effects
document.querySelectorAll('.property-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Agent Card Hover Effects
document.querySelectorAll('.agent-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Form Validation and Submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Basic form validation
        const name = contactForm.querySelector('input[name="name"]').value;
        const email = contactForm.querySelector('input[name="email"]').value;
        const message = contactForm.querySelector('textarea[name="message"]').value;
        
        if (!name || !email || !message) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Simulate form submission
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        // Simulate API call
        setTimeout(() => {
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }, 1500);
    });
}

// Newsletter Form
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = newsletterForm.querySelector('input[type="email"]').value;
        
        if (!email) {
            alert('Please enter your email address');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Simulate form submission
        const submitButton = newsletterForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        submitButton.disabled = true;
        submitButton.textContent = 'Subscribing...';
        
        // Simulate API call
        setTimeout(() => {
            alert('Thank you for subscribing to our newsletter!');
            newsletterForm.reset();
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }, 1500);
    });
}

// Intersection Observer for Animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadein');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements with animation classes
document.querySelectorAll('.animate-up, .animate-scale').forEach(element => {
    observer.observe(element);
});

// Parallax Effect for Hero Section
const hero = document.querySelector('.premium-hero');
if (hero) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        hero.style.backgroundPositionY = `${scrolled * 0.5}px`;
    });
}

// Property Image Loading Animation
document.querySelectorAll('.property-image img').forEach(img => {
    img.addEventListener('load', () => {
        img.classList.add('loaded');
    });
});

// Agent Image Loading Animation
document.querySelectorAll('.agent-image img').forEach(img => {
    img.addEventListener('load', () => {
        img.classList.add('loaded');
    });
});

// Property Search Functionality
const searchInput = document.querySelector('.search-box input');
const propertyCards = document.querySelectorAll('.property-card');

if (searchInput && propertyCards.length > 0) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        propertyCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const location = card.querySelector('.property-location').textContent.toLowerCase();
            const description = card.querySelector('.property-description').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || location.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Property Filter Functionality
const filterSelects = document.querySelectorAll('.search-filters select');
if (filterSelects.length > 0 && propertyCards.length > 0) {
    filterSelects.forEach(select => {
        select.addEventListener('change', () => {
            const propertyType = filterSelects[0].value;
            const priceRange = filterSelects[1].value;
            const bedrooms = filterSelects[2].value;
            
            propertyCards.forEach(card => {
                const cardType = card.dataset.type;
                const cardPrice = parseInt(card.dataset.price);
                const cardBedrooms = parseInt(card.dataset.bedrooms);
                
                let showCard = true;
                
                if (propertyType && cardType !== propertyType) {
                    showCard = false;
                }
                
                if (priceRange) {
                    const [min, max] = priceRange.split('-').map(Number);
                    if (cardPrice < min || (max && cardPrice > max)) {
                        showCard = false;
                    }
                }
                
                if (bedrooms && cardBedrooms < parseInt(bedrooms)) {
                    showCard = false;
                }
                
                card.style.display = showCard ? 'block' : 'none';
            });
        });
    });
}

// Property Favorite Functionality
document.querySelectorAll('.action-btn').forEach(btn => {
    if (btn.querySelector('.fa-heart')) {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            const icon = btn.querySelector('i');
            if (btn.classList.contains('active')) {
                icon.style.color = '#E74C3C';
            } else {
                icon.style.color = '';
            }
        });
    }
});

// Property Share Functionality
document.querySelectorAll('.action-btn').forEach(btn => {
    if (btn.querySelector('.fa-share')) {
        btn.addEventListener('click', () => {
            // Get property details
            const card = btn.closest('.property-card');
            const title = card.querySelector('h3').textContent;
            const price = card.querySelector('.property-price').textContent;
            const location = card.querySelector('.property-location').textContent;
            
            // Create share text
            const shareText = `Check out this property: ${title} - ${price} - ${location}`;
            
            // Check if Web Share API is available
            if (navigator.share) {
                navigator.share({
                    title: 'Property Share',
                    text: shareText,
                    url: window.location.href
                }).catch(console.error);
            } else {
                // Fallback: Copy to clipboard
                navigator.clipboard.writeText(shareText).then(() => {
                    alert('Property details copied to clipboard!');
                }).catch(console.error);
            }
        });
    }
}); 