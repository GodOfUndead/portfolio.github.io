// Mobile Menu Toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        navToggle.classList.remove('active');
    }
});

// Smooth scrolling for all anchor links
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
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
        // Scroll Down
        navbar.classList.remove('scroll-up');
        navbar.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
        // Scroll Up
        navbar.classList.remove('scroll-down');
        navbar.classList.add('scroll-up');
    }
    lastScroll = currentScroll;
});

// Form validation and submission
const bookingForm = document.querySelector('.booking-form');
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Basic form validation
        const formData = new FormData(bookingForm);
        let isValid = true;
        let firstInvalidField = null;
        
        formData.forEach((value, key) => {
            const field = bookingForm.querySelector(`[name="${key}"]`);
            if (!value && key !== 'notes') {
                isValid = false;
                field.classList.add('invalid');
                if (!firstInvalidField) firstInvalidField = field;
            } else {
                field.classList.remove('invalid');
            }
        });
        
        if (isValid) {
            // Show loading state
            const submitButton = bookingForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';
            
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Show success message
                showNotification('Thank you for your booking! We will contact you shortly to confirm your appointment.', 'success');
            bookingForm.reset();
            } catch (error) {
                showNotification('Sorry, there was an error processing your booking. Please try again.', 'error');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        } else {
            firstInvalidField.focus();
            showNotification('Please fill in all required fields.', 'error');
        }
    });
}

// Image gallery hover effect and lightbox
const galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const imgSrc = item.querySelector('img').src;
        openLightbox(imgSrc);
    });
});

function openLightbox(imageSrc) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <img src="${imageSrc}" alt="Gallery Image">
            <button class="lightbox-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';
    
    // Fade in animation
    setTimeout(() => lightbox.classList.add('active'), 10);
    
    // Close lightbox
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.className === 'lightbox-close') {
            lightbox.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(lightbox);
                document.body.style.overflow = '';
            }, 300);
        }
});
}

// Testimonials auto-scroll with pause on hover
const testimonialsSlider = document.querySelector('.testimonials-slider');
if (testimonialsSlider) {
    let currentIndex = 0;
    const testimonials = testimonialsSlider.querySelectorAll('.testimonial');
    let scrollInterval;
    
    function startAutoScroll() {
        scrollInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        testimonialsSlider.scrollTo({
            left: testimonials[currentIndex].offsetLeft,
            behavior: 'smooth'
        });
        }, 5000);
    }
    
    function stopAutoScroll() {
        clearInterval(scrollInterval);
    }
    
    testimonialsSlider.addEventListener('mouseenter', stopAutoScroll);
    testimonialsSlider.addEventListener('mouseleave', startAutoScroll);
    
    startAutoScroll();
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 800,
    once: true,
    offset: 100
});

// Add loading animation to images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('load', () => {
        img.classList.add('loaded');
    });
});

// Parallax effect for hero section
const hero = document.querySelector('.hero');
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    hero.style.backgroundPositionY = `${scrolled * 0.5}px`;
});

// Initialize date picker with minimum date as today
const dateInput = document.querySelector('#date');
if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
}

// Initialize time picker with business hours
const timeInput = document.querySelector('#time');
if (timeInput) {
    timeInput.min = '09:00';
    timeInput.max = '20:00';
}

// Add hover effect to service cards
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Add hover effect to stylist cards
document.querySelectorAll('.stylist-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Animate elements on scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.service-card, .stylist-card, .gallery-item, .testimonial');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        
        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

// Initial check for elements in view
window.addEventListener('load', animateOnScroll);
window.addEventListener('scroll', animateOnScroll);

// Services Data
const services = [
    {
        id: 1,
        name: 'Haircut & Styling',
        description: 'Professional haircuts and styling for all hair types',
        features: ['Consultation included', 'Custom styling', 'Hair care advice'],
        price: 45,
        image: 'https://source.unsplash.com/random/400x300/?haircut'
    },
    {
        id: 2,
        name: 'Hair Coloring',
        description: 'Expert color services for stunning results',
        features: ['Full color', 'Highlights', 'Balayage'],
        price: 85,
        image: 'https://source.unsplash.com/random/400x300/?hair-color'
    },
    {
        id: 3,
        name: 'Facial Treatments',
        description: 'Rejuvenating facials for radiant skin',
        features: ['Deep cleansing', 'Anti-aging', 'Hydrating'],
        price: 65,
        image: 'https://source.unsplash.com/random/400x300/?facial'
    }
];

// Stylists Data
const stylists = [
    {
        id: 1,
        name: 'Sarah Johnson',
        title: 'Master Stylist',
        bio: '15+ years of experience in hair styling and coloring',
        specialties: ['Haircuts', 'Coloring', 'Styling'],
        image: 'https://source.unsplash.com/random/400x400/?stylist'
    },
    {
        id: 2,
        name: 'Michael Brown',
        title: 'Color Specialist',
        bio: 'Expert in balayage and creative coloring techniques',
        specialties: ['Balayage', 'Highlights', 'Color Correction'],
        image: 'https://source.unsplash.com/random/400x400/?hairdresser'
    },
    {
        id: 3,
        name: 'Emily Davis',
        title: 'Skin Care Specialist',
        bio: 'Certified in advanced facial treatments and skin care',
        specialties: ['Facials', 'Skin Care', 'Treatments'],
        image: 'https://source.unsplash.com/random/400x400/?beautician'
    }
];

// Testimonials Data
const testimonials = [
    {
        id: 1,
        name: 'Jessica Wilson',
        rating: 5,
        comment: 'The best salon experience I\'ve ever had. Sarah is amazing with hair color!',
        image: 'https://source.unsplash.com/random/100x100/?woman'
    },
    {
        id: 2,
        name: 'David Thompson',
        rating: 5,
        comment: 'Michael\'s attention to detail is incredible. My balayage turned out perfect!',
        image: 'https://source.unsplash.com/random/100x100/?man'
    },
    {
        id: 3,
        name: 'Lisa Anderson',
        rating: 5,
        comment: 'Emily\'s facial treatments are rejuvenating. My skin has never looked better!',
        image: 'https://source.unsplash.com/random/100x100/?woman'
    }
];

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeServices();
    initializeStylists();
    initializeGallery();
    initializeBooking();
    initializeTestimonials();
});

// Navigation Functions
function initializeNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    navToggle.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar')) {
            navLinks.style.display = 'none';
        }
    });
}

// Services Functions
function initializeServices() {
    const servicesGrid = document.querySelector('.services-grid');

    services.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        serviceCard.innerHTML = `
            <div class="service-image">
                <img src="${service.image}" alt="${service.name}">
            </div>
            <div class="service-details">
                <h3>${service.name}</h3>
                <p>${service.description}</p>
                <ul class="service-features">
                    ${service.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <span class="price">From $${service.price}</span>
            </div>
        `;
        servicesGrid.appendChild(serviceCard);
    });
}

// Stylists Functions
function initializeStylists() {
    const stylistsGrid = document.querySelector('.stylists-grid');

    stylists.forEach(stylist => {
        const stylistCard = document.createElement('div');
        stylistCard.className = 'stylist-card';
        stylistCard.innerHTML = `
            <div class="stylist-image">
                <img src="${stylist.image}" alt="${stylist.name}">
            </div>
            <div class="stylist-details">
                <h3>${stylist.name}</h3>
                <p class="stylist-title">${stylist.title}</p>
                <p class="stylist-bio">${stylist.bio}</p>
                <div class="stylist-specialties">
                    ${stylist.specialties.map(specialty => `<span>${specialty}</span>`).join('')}
                </div>
            </div>
        `;
        stylistsGrid.appendChild(stylistCard);
    });
}

// Gallery Functions
function initializeGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            openLightbox(img.src);
        });
    });
}

// Booking Functions
function initializeBooking() {
    const form = document.getElementById('booking-form');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validate form
        if (validateBookingForm(data)) {
            // Show success message
            showNotification('Appointment booked successfully! We will contact you shortly.', 'success');
            form.reset();
        }
    });
}

function validateBookingForm(data) {
    // Basic validation
    if (!data.name || !data.email || !data.phone || !data.service || !data.stylist || !data.date || !data.time) {
        showNotification('Please fill in all required fields', 'error');
        return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Please enter a valid email address', 'error');
        return false;
    }
    
    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(data.phone)) {
        showNotification('Please enter a valid phone number', 'error');
        return false;
    }
    
    // Date validation
    const selectedDate = new Date(data.date);
    const today = new Date();
    if (selectedDate < today) {
        showNotification('Please select a future date', 'error');
        return false;
    }
    
    return true;
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