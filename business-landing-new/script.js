document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles.js if the container exists
    if (document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 60,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#ffffff"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": 0.3,
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 2,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#ffffff",
                    "opacity": 0.2,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 1,
                    "direction": "none",
                    "random": true,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 0.8
                        }
                    },
                    "push": {
                        "particles_nb": 4
                    }
                }
            },
            "retina_detect": true
        });
    }
    
    // Custom cursor functionality
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-dot-outline');
    
    if (cursorDot && cursorOutline) {
        // Show cursor elements when mouse moves
        document.addEventListener('mousemove', (e) => {
            if (cursorDot.style.opacity !== '1') {
                cursorDot.style.opacity = '1';
                cursorOutline.style.opacity = '1';
            }
            
            // Position dot at cursor position
            window.requestAnimationFrame(() => {
                cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
                // Slight delay for outline for smooth effect
                setTimeout(() => {
                    cursorOutline.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
                }, 50);
            });
        });
        
        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            cursorDot.style.opacity = '0';
            cursorOutline.style.opacity = '0';
        });
        
        // Cursor effects on links and buttons
        const interactiveElements = document.querySelectorAll('a, button, input, .btn, .interactive');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseover', () => {
                cursorDot.style.transform += ' scale(1.5)';
                cursorOutline.style.transform += ' scale(1.5)';
                cursorOutline.style.borderColor = 'var(--accent)';
            });
            
            el.addEventListener('mouseleave', () => {
                cursorDot.style.transform = cursorDot.style.transform.replace(' scale(1.5)', '');
                cursorOutline.style.transform = cursorOutline.style.transform.replace(' scale(1.5)', '');
                cursorOutline.style.borderColor = 'var(--primary)';
            });
        });
    }

    // Header scroll effect with throttling
    let ticking = false;
    
    function handleScroll() {
        const header = document.querySelector('.header');
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(handleScroll);
            ticking = true;
        }
    });

    // 3D Parallax Effect for Hero Image
    const heroImage = document.querySelector('.hero-image');
    const dashboardPreview = document.querySelector('.dashboard-preview');
    
    if (heroImage && dashboardPreview) {
        const heroSection = document.querySelector('.hero');
        
        heroSection.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth - 0.5;
            const mouseY = e.clientY / window.innerHeight - 0.5;
            
            const rotateX = mouseY * 10; // Limit rotation to 10 degrees
            const rotateY = -mouseX * 10;
            const translateZ = 50 + (Math.abs(mouseX) + Math.abs(mouseY)) * 30;
            
            dashboardPreview.style.transform = `
                perspective(1000px) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg)
                translateZ(${translateZ}px)
            `;
        });
        
        // Reset position when mouse leaves
        heroSection.addEventListener('mouseleave', () => {
            dashboardPreview.style.transform = 'perspective(1000px) rotateY(-5deg) rotateX(5deg)';
        });
    }
    
    // Typewriter effect for headlines
    function initTypewriter() {
        const headlines = document.querySelectorAll('.typewriter');
        
        headlines.forEach(headline => {
            const text = headline.innerHTML;
            headline.innerHTML = '';
            headline.style.visibility = 'visible';
            
            let i = 0;
            const speed = 50; // Typing speed in milliseconds
            
            function type() {
                if (i < text.length) {
                    headline.innerHTML += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                }
            }
            
            type();
        });
    }
    
    // Initialize typewriter effect
    initTypewriter();

    // Initialize Intersection Observer for animations with reveal effects
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        // Feature cards animation
        const featureCards = document.querySelectorAll('.feature-card');
        const featureObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('active');
                        
                        // Animate progress bar if present
                        const progressFill = entry.target.querySelector('.progress-fill');
                        if (progressFill) {
                            const width = progressFill.getAttribute('data-width');
                            progressFill.style.width = `${width}%`;
                            
                            // Add percentage to label
                            const progressLabel = entry.target.querySelector('.progress-label');
                            if (progressLabel) {
                                progressLabel.setAttribute('data-percent', `${width}%`);
                            }
                        }
                    }, index * 100); // Staggered animation
                    featureObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        featureCards.forEach(card => {
            featureObserver.observe(card);
            // Fallback to ensure cards are visible even if intersection observer doesn't fire
            setTimeout(() => {
                if (!card.classList.contains('active')) {
                    card.classList.add('active');
                    
                    // Animate progress bar
                    const progressFill = card.querySelector('.progress-fill');
                    if (progressFill) {
                        const width = progressFill.getAttribute('data-width');
                        progressFill.style.width = `${width}%`;
                        
                        // Add percentage to label
                        const progressLabel = card.querySelector('.progress-label');
                        if (progressLabel) {
                            progressLabel.setAttribute('data-percent', `${width}%`);
                        }
                    }
                }
            }, 1000);
        });

        // Dashboard features animation
        const dashboardFeatures = document.querySelectorAll('.dashboard-feature');
        const dashboardObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('active');
                    }, index * 200); // Staggered animation
                    dashboardObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        dashboardFeatures.forEach(feature => {
            dashboardObserver.observe(feature);
            // Fallback to ensure features are visible even if intersection observer doesn't fire
            setTimeout(() => {
                if (!feature.classList.contains('active')) {
                    feature.classList.add('active');
                }
            }, 1500);
        });
    } else {
        // Fallback for browsers that don't support Intersection Observer
        document.querySelectorAll('.feature-card, .dashboard-feature').forEach(element => {
            element.classList.add('active');
        });
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('show');
            this.innerHTML = navLinks.classList.contains('show') ? 
                '<i class="fas fa-times"></i>' : 
                '<i class="fas fa-bars"></i>';
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            // Close mobile menu if open
            if (navLinks && navLinks.classList.contains('show')) {
                navLinks.classList.remove('show');
                if (mobileMenuBtn) {
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    });
    
    // Dashboard tabs functionality
    const tabs = document.querySelectorAll('.dashboard-tab');
    const screenContainers = document.querySelectorAll('.dashboard-screen-container');
    const tabIndicator = document.getElementById('tabIndicator');
    
    function updateTabIndicator() {
        const activeTab = document.querySelector('.dashboard-tab.active');
        if (!activeTab || !tabIndicator) return;
        
        // Get accurate measurements
        const tabWidth = activeTab.offsetWidth;
        const tabLeft = activeTab.offsetLeft;
        
        // Apply the measurements to the indicator
        tabIndicator.style.width = `${tabWidth}px`;
        tabIndicator.style.transform = `translateX(${tabLeft}px)`;
    }
    
    function setActiveTab(tabElement) {
        if (!tabElement || !tabIndicator) return;
        
        // Update active tab
        tabs.forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
        });
        tabElement.classList.add('active');
        tabElement.setAttribute('aria-selected', 'true');
        
        // Update tab indexes for keyboard navigation
        updateTabIndexes();
        
        // Update indicator position
        updateTabIndicator();
        
        // Show active screen
        const tabId = tabElement.getAttribute('data-tab');
        screenContainers.forEach(container => {
            const panelId = container.getAttribute('id');
            if (panelId === `${tabId}Panel`) {
                container.classList.add('active');
            } else {
                container.classList.remove('active');
            }
        });
    }
    
    // Set initial indicator position
    if (tabs.length > 0 && tabIndicator) {
        // Set an initial position for the tab indicator
        const firstTab = tabs[0];
        tabIndicator.style.width = `${firstTab.offsetWidth}px`;
        
        // Wait for DOM to be fully loaded before setting initial position
        window.addEventListener('load', () => {
            const activeTab = document.querySelector('.dashboard-tab.active') || tabs[0];
            setActiveTab(activeTab);
        });
        
        // Also update immediately (for browsers that might have already loaded)
        setTimeout(() => {
            updateTabIndicator();
        }, 100);
    }
    
    // Handle tab keyboard navigation (update tabindex values)
    function updateTabIndexes() {
        tabs.forEach(tab => {
            if (tab.classList.contains('active')) {
                tab.setAttribute('tabindex', '0');
            } else {
                tab.setAttribute('tabindex', '-1');
            }
        });
    }
    
    // Update indicator on window resize with throttling
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateTabIndicator, 50);
    });
    
    // Add click event to tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            setActiveTab(this);
        });
        
        // Add keyboard accessibility
        tab.addEventListener('keydown', function(e) {
            // Activate on Enter or Space key
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveTab(this);
            }
            
            // Allow arrow key navigation between tabs
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                
                const currentIndex = Array.from(tabs).indexOf(this);
                let nextIndex;
                
                if (e.key === 'ArrowRight') {
                    nextIndex = (currentIndex + 1) % tabs.length;
                } else {
                    nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                }
                
                tabs[nextIndex].focus();
                setActiveTab(tabs[nextIndex]);
            }
        });
    });
    
    // Testimonial slider
    const track = document.getElementById('testimonialsTrack');
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.testimonial-dot');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    let currentSlide = 0;
    
    // Check if elements exist
    if (track && slides.length > 0) {
        const slideCount = slides.length;
        
        function goToSlide(index) {
            // Check if elements exist before proceeding
            if (!track || slides.length === 0) return;
            
            if (index < 0) index = slideCount - 1;
            if (index >= slideCount) index = 0;
            
            currentSlide = index;
            const translateValue = -currentSlide * 100;
            track.style.transform = `translateX(${translateValue}%)`;
            
            // Update dots
            dots.forEach((dot, i) => {
                if (i === currentSlide) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
        
        // Initialize slider
        goToSlide(0);
        
        // Add event listeners
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                goToSlide(currentSlide - 1);
                // Reset auto slide timer
                clearInterval(slideInterval);
                startAutoSlide();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                goToSlide(currentSlide + 1);
                // Reset auto slide timer
                clearInterval(slideInterval);
                startAutoSlide();
            });
        }
        
        // Add dot click events
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                goToSlide(i);
                // Reset auto slide timer
                clearInterval(slideInterval);
                startAutoSlide();
            });
        });
        
        // Add swipe functionality for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        track.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
            // Pause auto slide on touch
            clearInterval(slideInterval);
        }, { passive: true });
        
        track.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            // Restart auto slide after touch
            startAutoSlide();
        }, { passive: true });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                goToSlide(currentSlide + 1); // Swipe left
            } else if (touchEndX > touchStartX + swipeThreshold) {
                goToSlide(currentSlide - 1); // Swipe right
            }
        }
        
        // Auto slide functionality
        let slideInterval;
        
        function startAutoSlide() {
            slideInterval = setInterval(() => {
                goToSlide(currentSlide + 1);
            }, 5000);
        }
        
        // Start auto slide
        startAutoSlide();
        
        // Pause on hover
        track.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        track.addEventListener('mouseleave', () => {
            startAutoSlide();
        });
    }
    
    // Parallax effect for hero section
    let parallaxTicking = false;
    
    function handleParallax() {
        const scrollPosition = window.pageYOffset;
        const heroImage = document.querySelector('.hero-image');
        const shapes = document.querySelectorAll('.floating-shape');
        
        if (heroImage) {
            heroImage.style.transform = `translateY(${scrollPosition * 0.1}px)`;
        }
        
        shapes.forEach((shape, index) => {
            const speed = index % 2 === 0 ? 0.05 : -0.05;
            shape.style.transform = `translateY(${scrollPosition * speed}px)`;
        });
        
        parallaxTicking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!parallaxTicking) {
            window.requestAnimationFrame(handleParallax);
            parallaxTicking = true;
        }
    });
}); 