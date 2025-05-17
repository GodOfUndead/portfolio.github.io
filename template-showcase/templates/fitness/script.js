// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const mobileMenu = document.createElement('div');
mobileMenu.className = 'mobile-menu';

// Create mobile menu content
const mobileMenuContent = `
    <div class="close-menu">
        <i class="fas fa-times"></i>
    </div>
    <a href="#home">Home</a>
    <a href="#classes">Classes</a>
    <a href="#trainers">Trainers</a>
    <a href="#membership">Membership</a>
    <a href="#nutrition">Nutrition</a>
    <a href="#contact">Contact</a>
    <button class="join-now">Join Now</button>
`;

mobileMenu.innerHTML = mobileMenuContent;
document.body.appendChild(mobileMenu);

// Toggle mobile menu
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.add('active');
    });
}

// Close mobile menu
const closeMenuBtn = document.querySelector('.close-menu');
if (closeMenuBtn) {
    closeMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
}

// Close mobile menu when clicking a link
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
});

// Class Schedule Data
const classSchedule = {
    monday: [
        { time: '6:00 AM', name: 'HIIT', trainer: 'John D.' },
        { time: '9:00 AM', name: 'Yoga', trainer: 'Sarah M.' },
        { time: '5:00 PM', name: 'CrossFit', trainer: 'Mike R.' }
    ],
    tuesday: [
        { time: '7:00 AM', name: 'Strength Training', trainer: 'John D.' },
        { time: '10:00 AM', name: 'Pilates', trainer: 'Sarah M.' },
        { time: '6:00 PM', name: 'HIIT', trainer: 'Mike R.' }
    ],
    wednesday: [
        { time: '6:00 AM', name: 'CrossFit', trainer: 'Mike R.' },
        { time: '9:00 AM', name: 'Yoga', trainer: 'Sarah M.' },
        { time: '5:00 PM', name: 'Strength Training', trainer: 'John D.' }
    ],
    thursday: [
        { time: '7:00 AM', name: 'HIIT', trainer: 'Mike R.' },
        { time: '10:00 AM', name: 'Pilates', trainer: 'Sarah M.' },
        { time: '6:00 PM', name: 'CrossFit', trainer: 'John D.' }
    ],
    friday: [
        { time: '6:00 AM', name: 'Strength Training', trainer: 'John D.' },
        { time: '9:00 AM', name: 'Yoga', trainer: 'Sarah M.' },
        { time: '5:00 PM', name: 'HIIT', trainer: 'Mike R.' }
    ],
    saturday: [
        { time: '8:00 AM', name: 'CrossFit', trainer: 'Mike R.' },
        { time: '10:00 AM', name: 'Yoga', trainer: 'Sarah M.' },
        { time: '12:00 PM', name: 'Strength Training', trainer: 'John D.' }
    ],
    sunday: [
        { time: '9:00 AM', name: 'Yoga', trainer: 'Sarah M.' },
        { time: '11:00 AM', name: 'HIIT', trainer: 'Mike R.' }
    ]
};

// Schedule Tabs Functionality
document.addEventListener('DOMContentLoaded', function() {
    const scheduleTabs = document.querySelectorAll('.tab-btn');
    const scheduleContent = document.querySelector('.schedule-content');

    function renderSchedule(day) {
        const classes = classSchedule[day] || [];
        scheduleContent.innerHTML = `
            <div class="schedule-day active" id="${day}">
                ${classes.map(classItem => `
                    <div class="class-card">
                        <div class="class-time">${classItem.time}</div>
                        <div class="class-info">
                            <h3>${classItem.name}</h3>
                            <p>With ${classItem.trainer}</p>
                        </div>
                        <a href="#booking" class="btn secondary">Book Now</a>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Initial render (Monday)
    renderSchedule('monday');

    scheduleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            scheduleTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // Render the selected day's schedule
            const day = tab.getAttribute('data-day');
            renderSchedule(day);
        });
    });
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
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Basic form validation
        const formData = new FormData(contactForm);
        let isValid = true;
        
        formData.forEach((value, key) => {
            if (!value && key !== 'textarea' && key !== 'phone') {
                isValid = false;
            }
        });
        
        if (isValid) {
            // Here you would typically send the form data to a server
            alert('Thank you for your interest! We will contact you shortly to discuss your fitness goals.');
            contactForm.reset();
        } else {
            alert('Please fill in all required fields.');
        }
    });
}

// Membership plan selection
const planButtons = document.querySelectorAll('.plan-button');
planButtons.forEach(button => {
    button.addEventListener('click', () => {
        const plan = button.closest('.plan-card').querySelector('h3').textContent;
        alert(`You've selected the ${plan} plan. We'll contact you shortly to complete your membership.`);
    });
});

// Animate elements on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.category-card, .trainer-card, .plan-card, .nutrition-card');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        
        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Initial check for elements in view
window.addEventListener('load', animateOnScroll);
window.addEventListener('scroll', animateOnScroll);

// Add loading animation to images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('load', () => {
        img.classList.add('loaded');
    });
});

// Video background fallback
const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
    heroVideo.addEventListener('error', () => {
        heroVideo.style.display = 'none';
        document.querySelector('.hero').style.backgroundImage = 'url("https://source.unsplash.com/random/1920x1080/?gym")';
    });
}

// Navbar Scroll Effect (scrolled class)
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle (navToggle)
const navToggle = document.querySelector('.nav-toggle');
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
    }
});

// Smooth Scroll for Navigation Links
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
        }
    });
});

// Newsletter Form
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        
        if (email) {
            const successMessage = document.createElement('p');
            successMessage.className = 'newsletter-success animate-fadein';
            successMessage.textContent = 'Thank you for subscribing!';
            
            newsletterForm.innerHTML = '';
            newsletterForm.appendChild(successMessage);
            
            // Reset form after 3 seconds
            setTimeout(() => {
                newsletterForm.innerHTML = '';
                newsletterForm.reset();
                location.reload();
            }, 3000);
        }
    });
}

// Intersection Observer for Animations
function animateOnScrollObserver() {
    const elements = document.querySelectorAll('.animate-up, .animate-zoom');
    
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
    
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        observer.observe(element);
    });
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    animateOnScrollObserver();
});

// Parallax Effect for Hero Section
const hero = document.querySelector('.hero');
if (hero) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        hero.style.backgroundPositionY = `${scrolled * 0.5}px`;
    });
}

// Modern Class Schedule Section
(function() {
  console.log('Schedule JS loaded');
  const classSchedule = {
    monday: [
      { time: '6:00 AM', name: 'HIIT', trainer: 'John D.' },
      { time: '9:00 AM', name: 'Yoga', trainer: 'Sarah M.' },
      { time: '5:00 PM', name: 'CrossFit', trainer: 'Mike R.' }
    ],
    tuesday: [
      { time: '7:00 AM', name: 'Strength Training', trainer: 'John D.' },
      { time: '10:00 AM', name: 'Pilates', trainer: 'Sarah M.' },
      { time: '6:00 PM', name: 'HIIT', trainer: 'Mike R.' }
    ],
    wednesday: [
      { time: '6:00 AM', name: 'CrossFit', trainer: 'Mike R.' },
      { time: '9:00 AM', name: 'Yoga', trainer: 'Sarah M.' },
      { time: '5:00 PM', name: 'Strength Training', trainer: 'John D.' }
    ],
    thursday: [
      { time: '7:00 AM', name: 'HIIT', trainer: 'Mike R.' },
      { time: '10:00 AM', name: 'Pilates', trainer: 'Sarah M.' },
      { time: '6:00 PM', name: 'CrossFit', trainer: 'John D.' }
    ],
    friday: [
      { time: '6:00 AM', name: 'Strength Training', trainer: 'John D.' },
      { time: '9:00 AM', name: 'Yoga', trainer: 'Sarah M.' },
      { time: '5:00 PM', name: 'HIIT', trainer: 'Mike R.' }
    ],
    saturday: [
      { time: '8:00 AM', name: 'CrossFit', trainer: 'Mike R.' },
      { time: '10:00 AM', name: 'Yoga', trainer: 'Sarah M.' },
      { time: '12:00 PM', name: 'Strength Training', trainer: 'John D.' }
    ],
    sunday: [
      { time: '9:00 AM', name: 'Yoga', trainer: 'Sarah M.' },
      { time: '11:00 AM', name: 'HIIT', trainer: 'Mike R.' }
    ]
  };

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  document.addEventListener('DOMContentLoaded', function() {
    const tabsContainer = document.getElementById('schedule-tabs');
    const contentContainer = document.getElementById('schedule-content');
    if (!tabsContainer || !contentContainer) return;

    // Generate tabs
    tabsContainer.innerHTML = days.map((d, i) =>
      `<button class="tab-btn${i === 0 ? ' active' : ''}" data-day="${d.key}">${d.label}</button>`
    ).join('');

    function renderSchedule(dayKey) {
      const classes = classSchedule[dayKey] || [];
      if (classes.length === 0) {
        contentContainer.innerHTML = `<div class="schedule-day"><p>No classes scheduled for this day.</p></div>`;
        return;
      }
      contentContainer.innerHTML = `
        <div class="schedule-day">
          ${classes.map(classItem => `
            <div class="class-card">
              <div class="class-time">${classItem.time}</div>
              <div class="class-info">
                <h3>${classItem.name}</h3>
                <p>With ${classItem.trainer}</p>
              </div>
              <a href="#booking" class="btn secondary">Book Now</a>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Initial render
    renderSchedule(days[0].key);

    // Tab click event
    tabsContainer.querySelectorAll('.tab-btn').forEach(tab => {
      tab.addEventListener('click', function() {
        tabsContainer.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        renderSchedule(this.getAttribute('data-day'));
      });
    });
  });
})(); 