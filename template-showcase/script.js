// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.createElement('div');
mobileMenu.className = 'mobile-menu';
mobileMenu.innerHTML = `
    <div class="close-menu">
        <i class="fas fa-times"></i>
    </div>
    <div class="nav-links">
        <a href="#templates">Templates</a>
        <a href="#features">Features</a>
        <a href="#contact">Contact</a>
    </div>
`;
document.body.appendChild(mobileMenu);

// Touch event handling for menu
menuToggle.addEventListener('touchstart', (e) => {
    e.preventDefault();
    mobileMenu.classList.add('active');
}, { passive: false });

mobileMenu.querySelector('.close-menu').addEventListener('touchstart', (e) => {
    e.preventDefault();
    mobileMenu.classList.remove('active');
}, { passive: false });

// Smooth Scrolling with touch support
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

// Navbar Scroll Effect with performance optimization
let lastScroll = 0;
const navbar = document.querySelector('.navbar');
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll <= 0) {
                navbar.classList.remove('scrolled');
            } else if (currentScroll > lastScroll) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });

// Template Demo with touch support
const templateCards = document.querySelectorAll('.template-card');

templateCards.forEach(card => {
    const demoBtn = card.querySelector('.demo-btn');
    const template = card.dataset.template;
    
    const showDemo = (e) => {
        e.preventDefault();
        // Show demo modal
        const modal = document.createElement('div');
        modal.className = 'demo-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>${template.charAt(0).toUpperCase() + template.slice(1)} Template Demo</h2>
                <div class="demo-video">
                    <iframe src="https://www.youtube.com/embed/YOUR_VIDEO_ID" 
                            frameborder="0" 
                            allowfullscreen
                            loading="lazy">
                    </iframe>
                </div>
                <div class="demo-features">
                    <h3>Key Features</h3>
                    <ul>
                        <li>Responsive Design</li>
                        <li>Modern UI/UX</li>
                        <li>Easy Customization</li>
                        <li>SEO Friendly</li>
                    </ul>
                </div>
                <button class="contact-btn">Contact Us</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .demo-modal {
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
                touch-action: none;
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
                -webkit-overflow-scrolling: touch;
            }
            .close-modal {
                position: absolute;
                top: 1rem;
                right: 1rem;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.5rem;
                touch-action: manipulation;
            }
            .demo-video {
                margin: 2rem 0;
                position: relative;
                padding-bottom: 56.25%;
                height: 0;
            }
            .demo-video iframe {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
            .demo-features {
                margin: 2rem 0;
            }
            .demo-features ul {
                list-style: none;
                margin-top: 1rem;
            }
            .demo-features li {
                margin-bottom: 0.5rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .demo-features li:before {
                content: '✓';
                color: var(--secondary-color);
            }
            .contact-btn {
                background: var(--secondary-color);
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 5px;
                cursor: pointer;
                transition: var(--transition);
                width: 100%;
                touch-action: manipulation;
            }
            .contact-btn:hover {
                background: #2980b9;
            }
        `;
        document.head.appendChild(style);
        
        // Close modal functionality with touch support
        const closeModal = () => {
            modal.remove();
            style.remove();
        };
        
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.querySelector('.close-modal').addEventListener('touchstart', (e) => {
            e.preventDefault();
            closeModal();
        }, { passive: false });
        
        // Contact button functionality
        const contactBtn = modal.querySelector('.contact-btn');
        contactBtn.addEventListener('click', () => {
            window.location.href = '#contact';
            closeModal();
        });
        contactBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            window.location.href = '#contact';
            closeModal();
        }, { passive: false });
    };
    
    demoBtn.addEventListener('click', showDemo);
    demoBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        showDemo(e);
    }, { passive: false });
});

// Contact Form Validation with mobile optimization
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

// Animate Elements on Scroll with performance optimization
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.template-card, .feature-card');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        
        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

// Use Intersection Observer for better performance
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('.template-card, .feature-card').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'all 0.5s ease';
    observer.observe(element);
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuBtn.classList.toggle('active');
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuBtn.classList.remove('active');
                }
            }
        });
    });

    // Template preview functionality
    const templateCards = document.querySelectorAll('.template-card');
    
    templateCards.forEach(card => {
        const previewBtn = card.querySelector('.preview-btn');
        const demoBtn = card.querySelector('.demo-btn');
        
        if (previewBtn) {
            previewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // The link will be handled by the browser
            });
        }
        
        if (demoBtn) {
            demoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const templateName = card.getAttribute('data-template');
                showDemoModal(templateName);
            });
        }
    });

    // Demo modal functionality
    function showDemoModal(templateName) {
        const modal = document.createElement('div');
        modal.className = 'demo-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-modal';
        closeBtn.innerHTML = '&times;';
        
        const templateInfo = getTemplateInfo(templateName);
        
        modalContent.innerHTML = `
            <h2>${templateInfo.title}</h2>
            <div class="modal-video">
                <video controls>
                    <source src="${templateInfo.videoSrc}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
            <div class="modal-features">
                <h3>Key Features</h3>
                <ul>
                    ${templateInfo.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
        `;
        
        modalContent.appendChild(closeBtn);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Close modal functionality
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        
        // Clean up when modal is closed
        modal.addEventListener('remove', () => {
            document.body.style.overflow = '';
        });
    }

    function getTemplateInfo(templateName) {
        const templates = {
            'restaurant': {
                title: 'Restaurant Template',
                videoSrc: 'templates/restaurant/demo.mp4',
                features: [
                    'Responsive menu display',
                    'Online reservation system',
                    'Food gallery with filtering',
                    'Customer reviews section',
                    'Location and contact information'
                ]
            },
            'salon': {
                title: 'Salon Template',
                videoSrc: 'templates/salon/demo.mp4',
                features: [
                    'Service booking system',
                    'Stylist profiles',
                    'Before/After gallery',
                    'Price list display',
                    'Customer testimonials'
                ]
            },
            'fitness': {
                title: 'Fitness Template',
                videoSrc: 'templates/fitness/demo.mp4',
                features: [
                    'Class schedule display',
                    'Trainer profiles',
                    'Membership plans',
                    'Progress tracking',
                    'Workout gallery'
                ]
            },
            'real-estate': {
                title: 'Real Estate Template',
                videoSrc: 'templates/real-estate/demo.mp4',
                features: [
                    'Property listings with filters',
                    'Virtual tour integration',
                    'Agent profiles',
                    'Contact form',
                    'Location map'
                ]
            }
        };
        
        return templates[templateName] || {
            title: 'Template Demo',
            videoSrc: '',
            features: ['No features available']
        };
    }
}); 