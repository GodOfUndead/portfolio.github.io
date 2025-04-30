/**
 * Enhanced Features for Reddit Clone
 * Adds loading effects, animations, and interactive elements
 */

document.addEventListener('DOMContentLoaded', () => {
    // Setup welcome hero section
    setupWelcomeHero();
    
    // Add shimmer loading effect
    addLoadingEffects();
    
    // Add scroll animations
    addScrollAnimations();
    
    // Add hover effects
    addPostHoverEffects();
    
    // Add post sorting capabilities
    setupSortingOptions();
    
    // Add confetti effect to upvotes
    addConfettiToUpvotes();
});

/**
 * Setup welcome hero section for new users
 */
function setupWelcomeHero() {
    const welcomeHero = document.querySelector('.welcome-hero');
    const closeButton = document.getElementById('close-welcome-hero');
    
    if (!welcomeHero || !closeButton) return;
    
    // Check if user has seen welcome hero
    const hasSeenWelcome = localStorage.getItem('redditly_seen_welcome') === 'true';
    
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('redditly_user') !== null;
    
    // Only show welcome hero for new, non-logged in users
    if (hasSeenWelcome || isLoggedIn) {
        welcomeHero.style.display = 'none';
    } else {
        // Show with animation
        welcomeHero.style.opacity = '0';
        welcomeHero.style.transform = 'translateY(-20px)';
        welcomeHero.style.display = 'flex';
        
        setTimeout(() => {
            welcomeHero.style.opacity = '1';
            welcomeHero.style.transform = 'translateY(0)';
            welcomeHero.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        }, 100);
    }
    
    // Setup close button
    closeButton.addEventListener('click', () => {
        // Fade out animation
        welcomeHero.style.opacity = '0';
        welcomeHero.style.transform = 'translateY(-20px)';
        
        // Hide after animation
        setTimeout(() => {
            welcomeHero.style.display = 'none';
        }, 500);
        
        // Mark as seen
        localStorage.setItem('redditly_seen_welcome', 'true');
    });
    
    // Setup hero buttons
    const signUpButton = welcomeHero.querySelector('.auth-button.sign-up');
    const loginButton = welcomeHero.querySelector('.auth-button.login');
    
    if (signUpButton && loginButton) {
        // Mark as seen and open respective modals when clicked
        signUpButton.addEventListener('click', () => {
            localStorage.setItem('redditly_seen_welcome', 'true');
            welcomeHero.style.display = 'none';
            
            // Open signup modal if it exists
            const signupModal = document.getElementById('signup-modal');
            if (signupModal) {
                signupModal.style.display = 'flex';
            }
        });
        
        loginButton.addEventListener('click', () => {
            localStorage.setItem('redditly_seen_welcome', 'true');
            welcomeHero.style.display = 'none';
            
            // Open login modal if it exists
            const loginModal = document.getElementById('login-modal');
            if (loginModal) {
                loginModal.style.display = 'flex';
            }
        });
    }
}

/**
 * Add loading shimmer effect to posts
 */
function addLoadingEffects() {
    // Create shimmer placeholders while posts load
    const postsContainer = document.querySelector('.posts');
    
    // Check if posts exist
    if (!postsContainer) return;
    
    // Get current posts
    const posts = postsContainer.querySelectorAll('.post');
    
    // If no posts found or already loaded, skip
    if (posts.length > 0) {
        // Add fadeIn animation to existing posts
        posts.forEach((post, index) => {
            post.style.animationDelay = `${index * 0.1}s`;
        });
        return;
    }
    
    // Create shimmer loading effect
    for (let i = 0; i < 3; i++) {
        const shimmer = document.createElement('div');
        shimmer.className = 'post-shimmer';
        shimmer.style.animationDelay = `${i * 0.2}s`;
        postsContainer.appendChild(shimmer);
    }
    
    // Remove shimmer after posts load (simulated for demo)
    setTimeout(() => {
        document.querySelectorAll('.post-shimmer').forEach(shimmer => {
            shimmer.remove();
        });
    }, 1500);
}

/**
 * Add scroll animations to posts and sidebar
 */
function addScrollAnimations() {
    // Add scroll animations using Intersection Observer
    const elements = document.querySelectorAll('.post, .sidebar-section, .trending-card');
    
    // Check if elements exist
    if (elements.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.1,
        rootMargin: '0px'
    });
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Add hover effects to posts
 */
function addPostHoverEffects() {
    const posts = document.querySelectorAll('.post');
    
    // Check if posts exist
    if (posts.length === 0) return;
    
    posts.forEach(post => {
        // Add mouseover effect
        post.addEventListener('mouseover', () => {
            // Add subtle shadow
            post.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.15)';
            post.style.transform = 'translateY(-3px)';
            post.style.borderColor = 'var(--button-blue)';
            
            // Highlight upvote and downvote buttons
            const upvoteBtn = post.querySelector('.upvote');
            const downvoteBtn = post.querySelector('.downvote');
            
            if (upvoteBtn && !upvoteBtn.classList.contains('active')) {
                upvoteBtn.style.color = 'rgba(255, 69, 0, 0.5)';
            }
            
            if (downvoteBtn && !downvoteBtn.classList.contains('active')) {
                downvoteBtn.style.color = 'rgba(113, 147, 255, 0.5)';
            }
        });
        
        // Reset on mouseout
        post.addEventListener('mouseout', () => {
            post.style.boxShadow = '';
            post.style.transform = '';
            post.style.borderColor = '';
            
            // Reset upvote and downvote buttons
            const upvoteBtn = post.querySelector('.upvote');
            const downvoteBtn = post.querySelector('.downvote');
            
            if (upvoteBtn && !upvoteBtn.classList.contains('active')) {
                upvoteBtn.style.color = '';
            }
            
            if (downvoteBtn && !downvoteBtn.classList.contains('active')) {
                downvoteBtn.style.color = '';
            }
        });
    });
}

/**
 * Setup post sorting options
 */
function setupSortingOptions() {
    // Get tabs
    const tabs = document.querySelectorAll('.tab');
    
    // Check if tabs exist
    if (tabs.length === 0) return;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Sort posts (simulated for demo)
            sortPosts(tab.textContent.trim().toLowerCase());
            
            // Add animation to tab
            tab.classList.add('animate__animated', 'animate__pulse');
            setTimeout(() => {
                tab.classList.remove('animate__animated', 'animate__pulse');
            }, 1000);
        });
    });
}

/**
 * Sort posts based on selected tab
 * @param {string} sortType - Type of sorting (best, hot, new, top)
 */
function sortPosts(sortType) {
    const postsContainer = document.querySelector('.posts');
    
    // Check if posts container exists
    if (!postsContainer) return;
    
    // Get all posts
    const posts = Array.from(postsContainer.querySelectorAll('.post'));
    
    // Remove all posts
    posts.forEach(post => post.remove());
    
    // Sort posts based on type (simulated for demo)
    switch (sortType) {
        case 'best':
            // Sort by upvotes - downvotes (highest first)
            posts.sort((a, b) => {
                const aVotes = parseInt(a.querySelector('.vote-count').textContent);
                const bVotes = parseInt(b.querySelector('.vote-count').textContent);
                return bVotes - aVotes;
            });
            break;
        case 'hot':
            // Sort by a combination of recency and votes
            posts.sort((a, b) => {
                const aVotes = parseInt(a.querySelector('.vote-count').textContent);
                const bVotes = parseInt(b.querySelector('.vote-count').textContent);
                
                // For demo, we're randomly sorting when "hot" is selected
                return (bVotes + Math.random() * 50) - (aVotes + Math.random() * 50);
            });
            break;
        case 'new':
            // Reverse the order (assuming newest are last in original order)
            posts.reverse();
            break;
        case 'top':
            // Sort by votes only
            posts.sort((a, b) => {
                const aVotes = parseInt(a.querySelector('.vote-count').textContent);
                const bVotes = parseInt(b.querySelector('.vote-count').textContent);
                return bVotes - aVotes;
            });
            break;
    }
    
    // Add shimmer loading effect
    for (let i = 0; i < 3; i++) {
        const shimmer = document.createElement('div');
        shimmer.className = 'post-shimmer';
        shimmer.style.animationDelay = `${i * 0.2}s`;
        postsContainer.appendChild(shimmer);
    }
    
    // Add posts back with delay
    setTimeout(() => {
        // Remove shimmer
        document.querySelectorAll('.post-shimmer').forEach(shimmer => {
            shimmer.remove();
        });
        
        // Add sorted posts back with animation
        posts.forEach((post, index) => {
            post.style.animationDelay = `${index * 0.1}s`;
            post.classList.add('animate__animated', 'animate__fadeInUp');
            postsContainer.appendChild(post);
            
            // Remove animation class after it completes
            setTimeout(() => {
                post.classList.remove('animate__animated', 'animate__fadeInUp');
            }, 1000);
        });
    }, 800);
    
    // Show notification for sorted posts
    showSortingNotification(sortType);
}

/**
 * Show notification for sorting
 * @param {string} sortType - Type of sorting (best, hot, new, top)
 */
function showSortingNotification(sortType) {
    // Create notification if it doesn't exist
    let notification = document.querySelector('.sort-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'sort-notification';
        document.body.appendChild(notification);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .sort-notification {
                position: fixed;
                top: 70px;
                left: 50%;
                transform: translateX(-50%);
                background-color: var(--button-blue);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
                z-index: 1000;
                font-weight: 600;
                font-size: 14px;
                opacity: 0;
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
            
            .sort-notification.show {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            
            .sort-notification.hide {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Set notification text
    notification.textContent = `Showing ${sortType} posts`;
    
    // Show notification
    notification.classList.remove('hide');
    notification.classList.add('show');
    
    // Hide notification after 2 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hide');
    }, 2000);
}

/**
 * Add confetti effect to upvotes
 */
function addConfettiToUpvotes() {
    // Find all upvote buttons
    const upvoteButtons = document.querySelectorAll('.vote-button.upvote');
    
    // Check if buttons exist
    if (upvoteButtons.length === 0) return;
    
    upvoteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Only show confetti if button is not already active
            if (!button.classList.contains('active')) {
                createConfetti(e.clientX, e.clientY);
            }
        });
    });
}

/**
 * Create confetti effect at click position
 * @param {number} x - X position
 * @param {number} y - Y position
 */
function createConfetti(x, y) {
    // Create confetti container
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.left = `${x}px`;
    confettiContainer.style.top = `${y}px`;
    confettiContainer.style.pointerEvents = 'none';
    document.body.appendChild(confettiContainer);
    
    // Create confetti pieces
    const colors = ['#FF4500', '#FF6E4A', '#FFA500', '#FFD700', '#0079D3'];
    
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.position = 'absolute';
        confetti.style.left = '0';
        confetti.style.top = '0';
        confetti.style.width = `${Math.random() * 5 + 5}px`;
        confetti.style.height = `${Math.random() * 3 + 3}px`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.opacity = Math.random() * 0.5 + 0.5;
        
        // Apply animation
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 60 + 40;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        confetti.animate([
            { transform: 'translate(0, 0) rotate(0)', opacity: 1 },
            { transform: `translate(${vx}px, ${vy}px) rotate(${Math.random() * 720 - 360}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 1000 + 1000,
            easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            fill: 'forwards'
        });
        
        confettiContainer.appendChild(confetti);
    }
    
    // Remove container after animations complete
    setTimeout(() => {
        confettiContainer.remove();
    }, 2000);
} 