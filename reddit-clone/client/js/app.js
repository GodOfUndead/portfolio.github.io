document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    init();
});

// Global data store
const store = {
    currentUser: null,
    posts: [],
    communities: [],
    comments: []
};

/**
 * Initialize data from Firebase or with defaults
 */
async function initData() {
    // First check if we have a connection to Firebase
    let useFirebase = false;
    
    try {
        // Check if Firebase is initialized
        if (window.firebaseDB) {
            useFirebase = true;
            console.log('Using Firebase for data storage');
        }
    } catch (error) {
        console.error('Firebase not available, using localStorage', error);
    }
    
    if (useFirebase) {
        // Load data from Firebase
        await loadDataFromFirebase();
    } else {
        // Load data from localStorage as fallback
        loadDataFromLocalStorage();
    }
    
    // Save initial data if needed
    if (store.communities.length === 0) {
        createDefaultData();
        saveDataToStorage();
    }
}

/**
 * Load data from localStorage
 */
function loadDataFromLocalStorage() {
    // Load communities
    store.communities = JSON.parse(localStorage.getItem('redditly_communities')) || [];
    
    // Load posts
    store.posts = JSON.parse(localStorage.getItem('redditly_posts')) || [];
    
    // Load comments
    store.comments = JSON.parse(localStorage.getItem('redditly_comments')) || [];
    
    // Load saved posts/comments if user is logged in
    if (store.currentUser) {
        store.savedPosts = JSON.parse(localStorage.getItem(`redditly_saved_posts_${store.currentUser.username}`)) || [];
        store.savedComments = JSON.parse(localStorage.getItem(`redditly_saved_comments_${store.currentUser.username}`)) || [];
    }
}

/**
 * Load data from Firebase
 */
async function loadDataFromFirebase() {
    try {
        // Load communities
        const communitiesSnapshot = await window.firebaseDB.communitiesRef.get();
        store.communities = communitiesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Load posts
        const postsSnapshot = await window.firebaseDB.postsRef.get();
        store.posts = postsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Load comments
        const commentsSnapshot = await window.firebaseDB.commentsRef.get();
        store.comments = commentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Load saved posts/comments if user is logged in
        if (store.currentUser) {
            const userDoc = await window.firebaseDB.usersRef.doc(store.currentUser.username).get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                store.savedPosts = userData.savedPosts || [];
                store.savedComments = userData.savedComments || [];
            }
        }
    } catch (error) {
        console.error('Error loading data from Firebase:', error);
        // Fall back to localStorage if Firebase fails
        loadDataFromLocalStorage();
    }
}

/**
 * Create default data for the app
 */
function createDefaultData() {
    // Default communities
    store.communities = [
        {
            id: '1',
            name: 'programming',
            description: 'A community for programming enthusiasts',
            subscribers: ['user1', 'user2'],
            createdAt: new Date().toISOString(),
            createdBy: 'user1'
        },
        {
            id: '2',
            name: 'webdev',
            description: 'Web development discussions',
            subscribers: ['user1'],
            createdAt: new Date().toISOString(),
            createdBy: 'user1'
        },
        {
            id: '3',
            name: 'reactjs',
            description: 'All things React',
            subscribers: ['user2'],
            createdAt: new Date().toISOString(),
            createdBy: 'user2'
        }
    ];
    
    // Default posts
    store.posts = [
        {
            id: '1',
            title: 'Announcing the Next Major Version of Our JavaScript Framework: What\'s New?',
            content: 'We\'re excited to share the upcoming features in our new release. The framework now includes improved performance, better type checking, and new hooks for state management.',
            type: 'text',
            author: 'devUser123',
            authorId: 'user1',
            communityId: '1',
            upvotes: ['user2'],
            downvotes: [],
            createdAt: new Date().toISOString(),
            comments: ['1', '2']
        },
        {
            id: '2',
            title: 'I built a Reddit clone with full functionality - here\'s what I learned',
            imageUrl: 'assets/post-image-placeholder.jpg',
            type: 'image',
            author: 'codeNinja42',
            authorId: 'user2',
            communityId: '2',
            upvotes: ['user1'],
            downvotes: [],
            createdAt: new Date().toISOString(),
            comments: ['3']
        },
        {
            id: '3',
            title: 'Best practices for managing state in large React applications',
            content: 'After working on several large-scale React projects, I\'ve compiled a list of best practices for state management that can help avoid common pitfalls. What has worked well for your teams?',
            type: 'text',
            author: 'reactEnthusiast',
            authorId: 'user1',
            communityId: '3',
            upvotes: ['user1', 'user2'],
            downvotes: [],
            createdAt: new Date().toISOString(),
            comments: []
        }
    ];
    
    // Default comments
    store.comments = [
        {
            id: '1',
            content: 'This is amazing! Can\'t wait to try out the new hooks.',
            authorId: 'user2',
            author: 'user2',
            postId: '1',
            upvotes: ['user1'],
            downvotes: [],
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            content: 'When is the expected release date?',
            authorId: 'user1',
            author: 'user1',
            postId: '1',
            upvotes: [],
            downvotes: [],
            createdAt: new Date().toISOString()
        },
        {
            id: '3',
            content: 'Great work! The UI looks very polished.',
            authorId: 'user1',
            author: 'user1',
            postId: '2',
            upvotes: ['user2'],
            downvotes: [],
            createdAt: new Date().toISOString()
        }
    ];
}

/**
 * Save data to both localStorage and Firebase
 */
async function saveDataToStorage() {
    // Always save to localStorage for offline functionality
    saveDataToLocalStorage();
    
    // Only attempt to save to Firebase if online
    if (window.navigator.onLine) {
        try {
            await saveDataToFirebase();
            console.log('Data saved to Firebase successfully');
        } catch (error) {
            console.error('Error saving to Firebase:', error);
            showNotification('Changes saved locally only. Will sync when online.', 'warning');
        }
    } else {
        console.log('Offline - data saved to localStorage only');
        showNotification('You are offline. Changes saved locally only.', 'warning');
    }
    
    // If user is logged in, update their user data
    if (store.currentUser && store.currentUser.uid) {
        try {
            // Get user saved posts and comments
            const savedPosts = [];
            const savedComments = [];
            
            // Find posts that the user has saved
            store.posts.forEach(post => {
                if (post.savedBy && post.savedBy.includes(store.currentUser.username)) {
                    savedPosts.push({
                        id: post.id,
                        title: post.title,
                        savedAt: new Date().toISOString()
                    });
                }
            });
            
            // Find comments that the user has saved (if any exist)
            store.posts.forEach(post => {
                if (post.comments) {
                    post.comments.forEach(comment => {
                        if (comment.savedBy && comment.savedBy.includes(store.currentUser.username)) {
                            savedComments.push({
                                id: comment.id,
                                text: comment.text,
                                postId: post.id,
                                savedAt: new Date().toISOString()
                            });
                        }
                    });
                }
            });
            
            // Update user document with saved items
            await window.firebaseDB.usersRef.doc(store.currentUser.uid).update({
                saved_posts: savedPosts,
                saved_comments: savedComments,
                last_active: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update local user data
            store.currentUser.saved_posts = savedPosts;
            store.currentUser.saved_comments = savedComments;
            localStorage.setItem('redditly_user', JSON.stringify(store.currentUser));
            
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    }
}

/**
 * Save data to localStorage
 */
function saveDataToLocalStorage() {
    // Save communities
    localStorage.setItem('redditly_communities', JSON.stringify(store.communities));
    
    // Save posts
    localStorage.setItem('redditly_posts', JSON.stringify(store.posts));
    
    // Save comments
    localStorage.setItem('redditly_comments', JSON.stringify(store.comments));
    
    // Save user's saved posts/comments if logged in
    if (store.currentUser) {
        localStorage.setItem(`redditly_saved_posts_${store.currentUser.username}`, JSON.stringify(store.savedPosts));
        localStorage.setItem(`redditly_saved_comments_${store.currentUser.username}`, JSON.stringify(store.savedComments));
    }
}

/**
 * Save data to Firebase
 */
async function saveDataToFirebase() {
    try {
        // Use batched writes for better performance
        const batch = window.firebaseDB.db.batch();
        
        // Save communities
        for (const community of store.communities) {
            const communityRef = window.firebaseDB.communitiesRef.doc(community.id);
            batch.set(communityRef, community);
        }
        
        // Save posts
        for (const post of store.posts) {
            const postRef = window.firebaseDB.postsRef.doc(post.id);
            batch.set(postRef, post);
        }
        
        // Save comments
        for (const comment of store.comments) {
            const commentRef = window.firebaseDB.commentsRef.doc(comment.id);
            batch.set(commentRef, comment);
        }
        
        // Save user data if logged in
        if (store.currentUser) {
            const userRef = window.firebaseDB.usersRef.doc(store.currentUser.username);
            batch.set(userRef, {
                savedPosts: store.savedPosts,
                savedComments: store.savedComments
            }, { merge: true });
        }
        
        // Commit all changes
        await batch.commit();
        console.log('Data saved to Firebase');
        
        // Also save to localStorage as backup
        saveDataToLocalStorage();
    } catch (error) {
        console.error('Error saving data to Firebase:', error);
        // Fall back to localStorage if Firebase fails
        saveDataToLocalStorage();
    }
}

/**
 * Log out the current user
 */
function logoutUser() {
    // Remove user from localStorage
    localStorage.removeItem('redditly_user');
    store.currentUser = null;
    
    // Update UI for guest user
    document.querySelector('.login')?.classList.remove('hidden');
    document.querySelector('.sign-up')?.classList.remove('hidden');
    document.querySelector('.user-menu')?.classList.add('hidden');
    
    // Update sidebar
    updateSidebar();
    
    // Refresh posts
    loadAndRenderPosts();
    
    // Display success message
    showNotification('You have been logged out');
}

/**
 * Set up login and signup modals with improved scrolling behavior
 */
function setupModals() {
    const loginButton = document.querySelector('.login');
    const signUpButton = document.querySelector('.sign-up');
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const communityModal = document.getElementById('create-community-modal');
    const postModal = document.getElementById('create-post-modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToLogin = document.getElementById('switch-to-login');
    const logoutButton = document.querySelector('.user-dropdown-content .dropdown-item:last-child');
    
    // Set up logout handler
    logoutButton?.addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
    });
    
    // Function to improve modal accessibility
    function setupModalAccessibility(modal) {
        // Ensure modal is scrollable if content overflows
        const modalContent = modal.querySelector('.modal-content');
        
        // Add scroll to bottom button if needed
        if (!modal.querySelector('.scroll-to-bottom')) {
            const scrollButton = document.createElement('button');
            scrollButton.className = 'scroll-to-bottom';
            scrollButton.innerHTML = '<i class="fas fa-arrow-down"></i>';
            scrollButton.title = 'Scroll to Bottom';
            scrollButton.style.display = 'none';
            
            // Add button to modal (outside modal-content to stay fixed)
            modal.appendChild(scrollButton);
            
            // Add click handler
            scrollButton.addEventListener('click', () => {
                const form = modalContent.querySelector('form');
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    modalContent.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }
            });
            
            // Show/hide button based on scroll position
            modal.addEventListener('scroll', () => {
                const modalHeight = modal.clientHeight;
                const contentHeight = modalContent.offsetHeight;
                const scrollPosition = modal.scrollTop;
                
                // Show button if not near the bottom
                if (contentHeight > modalHeight && scrollPosition < contentHeight - modalHeight - 100) {
                    scrollButton.style.display = 'flex';
                } else {
                    scrollButton.style.display = 'none';
                }
            });
        }
        
        // Add a scroll to top button as well
        if (!modal.querySelector('.scroll-to-top')) {
            const scrollTopButton = document.createElement('button');
            scrollTopButton.className = 'scroll-to-top';
            scrollTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
            scrollTopButton.title = 'Scroll to Top';
            scrollTopButton.style.display = 'none';
            
            // Add button to modal
            modal.appendChild(scrollTopButton);
            
            // Add click handler
            scrollTopButton.addEventListener('click', () => {
                modal.scrollTo({ top: 0, behavior: 'smooth' });
            });
            
            // Show/hide button based on scroll position
            modal.addEventListener('scroll', () => {
                if (modal.scrollTop > 100) {
                    scrollTopButton.style.display = 'flex';
                } else {
                    scrollTopButton.style.display = 'none';
                }
            });
        }
    }
    
    // Open login modal
    loginButton?.addEventListener('click', () => {
        loginModal.style.display = 'flex';
        setupModalAccessibility(loginModal);
    });
    
    // Open signup modal
    signUpButton?.addEventListener('click', () => {
        signupModal.style.display = 'flex';
        setupModalAccessibility(signupModal);
    });
    
    // Close all modals
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            loginModal.style.display = 'none';
            signupModal.style.display = 'none';
            communityModal.style.display = 'none';
            postModal.style.display = 'none';
        });
    });
    
    // Switch between modals
    switchToSignup?.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        signupModal.style.display = 'flex';
        setupModalAccessibility(signupModal);
    });
    
    switchToLogin?.addEventListener('click', (e) => {
        e.preventDefault();
        signupModal.style.display = 'none';
        loginModal.style.display = 'flex';
        setupModalAccessibility(loginModal);
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === signupModal) {
            signupModal.style.display = 'none';
        }
        if (e.target === communityModal) {
            communityModal.style.display = 'none';
        }
        if (e.target === postModal) {
            postModal.style.display = 'none';
        }
    });
    
    // Handle form submissions
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        // Mock login - in a real app this would call the backend
        console.log('Login attempt:', username, password);
        loginUser(username, password);
    });
    
    signupForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;
        
        // Mock signup - in a real app this would call the backend
        console.log('Signup attempt:', email, username, password);
        signupUser(email, username, password);
    });
}

/**
 * Set up post voting functionality
 */
function setupVoting() {
    const upvoteButtons = document.querySelectorAll('.vote-button.upvote');
    const downvoteButtons = document.querySelectorAll('.vote-button.downvote');
    
    upvoteButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Check if user is logged in
            if (!store.currentUser) {
                const loginModal = document.getElementById('login-modal');
                loginModal.style.display = 'flex';
                return;
            }
            
            const post = button.closest('.post');
            const postId = post.dataset.postId;
            const voteCount = post.querySelector('.vote-count');
            const downvoteButton = post.querySelector('.downvote');
            
            // Add visual feedback - subtle scale animation
            button.style.transform = 'scale(1.2)';
            setTimeout(() => {
                button.style.transform = '';
            }, 200);
            
            // Find the post in the store
            const storePost = store.posts.find(p => p.id === postId);
            if (!storePost) return;
            
            // Initialize arrays if they don't exist
            if (!storePost.upvotes) storePost.upvotes = [];
            if (!storePost.downvotes) storePost.downvotes = [];
            
            // Toggle active state
            if (button.classList.contains('active')) {
                // Remove upvote
                button.classList.remove('active');
                storePost.upvotes = storePost.upvotes.filter(id => id !== store.currentUser.username);
                voteCount.textContent = parseInt(voteCount.textContent) - 1;
                
                // Animate vote count down
                voteCount.style.color = '';
                voteCount.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    voteCount.style.transform = '';
                }, 200);
            } else {
                // Add upvote
                button.classList.add('active');
                if (!storePost.upvotes.includes(store.currentUser.username)) {
                    storePost.upvotes.push(store.currentUser.username);
                }
                voteCount.textContent = parseInt(voteCount.textContent) + 1;
                
                // Animate vote count up
                voteCount.style.color = 'var(--upvote-color)';
                voteCount.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    voteCount.style.transform = '';
                }, 200);
                
                // Remove downvote if it exists
                if (downvoteButton.classList.contains('active')) {
                    downvoteButton.classList.remove('active');
                    storePost.downvotes = storePost.downvotes.filter(id => id !== store.currentUser.username);
                    voteCount.textContent = parseInt(voteCount.textContent) + 1;
                }
            }
            
            // Save to localStorage
            saveDataToLocalStorage();
        });
    });
    
    downvoteButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Check if user is logged in
            if (!store.currentUser) {
                const loginModal = document.getElementById('login-modal');
                loginModal.style.display = 'flex';
                return;
            }
            
            const post = button.closest('.post');
            const postId = post.dataset.postId;
            const voteCount = post.querySelector('.vote-count');
            const upvoteButton = post.querySelector('.upvote');
            
            // Add visual feedback - subtle scale animation
            button.style.transform = 'scale(1.2)';
            setTimeout(() => {
                button.style.transform = '';
            }, 200);
            
            // Find the post in the store
            const storePost = store.posts.find(p => p.id === postId);
            if (!storePost) return;
            
            // Initialize arrays if they don't exist
            if (!storePost.upvotes) storePost.upvotes = [];
            if (!storePost.downvotes) storePost.downvotes = [];
            
            // Toggle active state
            if (button.classList.contains('active')) {
                // Remove downvote
                button.classList.remove('active');
                storePost.downvotes = storePost.downvotes.filter(id => id !== store.currentUser.username);
                voteCount.textContent = parseInt(voteCount.textContent) + 1;
                
                // Animate vote count up
                voteCount.style.color = '';
                voteCount.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    voteCount.style.transform = '';
                }, 200);
            } else {
                // Add downvote
                button.classList.add('active');
                if (!storePost.downvotes.includes(store.currentUser.username)) {
                    storePost.downvotes.push(store.currentUser.username);
                }
                voteCount.textContent = parseInt(voteCount.textContent) - 1;
                
                // Animate vote count down
                voteCount.style.color = 'var(--downvote-color)';
                voteCount.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    voteCount.style.transform = '';
                }, 200);
                
                // Remove upvote if it exists
                if (upvoteButton.classList.contains('active')) {
                    upvoteButton.classList.remove('active');
                    storePost.upvotes = storePost.upvotes.filter(id => id !== store.currentUser.username);
                    voteCount.textContent = parseInt(voteCount.textContent) - 1;
                }
            }
            
            // Save to localStorage
            saveDataToLocalStorage();
        });
    });
}

/**
 * Set up content tabs switching
 */
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Sort posts based on tab
            const sortType = tab.querySelector('span').textContent.toLowerCase();
            
            // Re-render posts with the new sort
            let sortedPosts = [...store.posts];
            
            if (sortType === 'best') {
                // Best: Most upvotes - downvotes
                sortedPosts.sort((a, b) => {
                    const aVotes = (a.upvotes?.length || 0) - (a.downvotes?.length || 0);
                    const bVotes = (b.upvotes?.length || 0) - (b.downvotes?.length || 0);
                    return bVotes - aVotes;
                });
            } else if (sortType === 'hot') {
                // Hot: Recent with most activity
                sortedPosts.sort((a, b) => {
                    const aScore = (a.upvotes?.length || 0) + (a.downvotes?.length || 0) + (a.comments?.length || 0);
                    const bScore = (b.upvotes?.length || 0) + (b.downvotes?.length || 0) + (b.comments?.length || 0);
                    // Mix in recency
                    const aDate = new Date(a.createdAt);
                    const bDate = new Date(b.createdAt);
                    const aRecency = Math.max(0, (Date.now() - aDate) / (1000 * 60 * 60 * 24)); // days ago
                    const bRecency = Math.max(0, (Date.now() - bDate) / (1000 * 60 * 60 * 24)); // days ago
                    
                    return (bScore / Math.sqrt(bRecency + 1)) - (aScore / Math.sqrt(aRecency + 1));
                });
            } else if (sortType === 'new') {
                // New: Most recent first
                sortedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            } else if (sortType === 'top') {
                // Top: All-time most upvotes
                sortedPosts.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));
            }
            
            // Update store.posts temporarily to render sorted posts
            const originalPosts = [...store.posts];
            store.posts = sortedPosts;
            loadAndRenderPosts();
            store.posts = originalPosts; // Restore original order
        });
    });
}

/**
 * Set up optimizations for mobile devices
 */
function setupMobileOptimizations() {
    // Check if viewport width is small
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Hide some elements that are less important on mobile
        const postDescriptions = document.querySelectorAll('.post-text');
        postDescriptions.forEach(desc => {
            if (desc.textContent.length > 120) {
                const truncated = desc.textContent.substring(0, 120) + '...';
                desc.textContent = truncated;
            }
        });
    }
    
    // Responsive handling for window resize
    window.addEventListener('resize', () => {
        // Add responsive adjustments here if needed
    });
}

/**
 * Initialize user state (logged in or not)
 */
function initUserState() {
    // Check if user is logged in from localStorage
    const userJson = localStorage.getItem('redditly_user');
    
    if (userJson) {
        try {
            const userData = JSON.parse(userJson);
            
            // Verify user still exists in Firebase
            if (userData.uid) {
                window.firebaseDB.usersRef.doc(userData.uid).get()
                    .then(doc => {
                        if (doc.exists) {
                            // User exists, update store with latest data
                            const firebaseData = doc.data();
                            store.currentUser = {
                                ...userData,
                                saved_posts: firebaseData.saved_posts || [],
                                saved_comments: firebaseData.saved_comments || []
                            };
                            
                            // Update UI for logged in user
                            document.querySelector('.login')?.classList.add('hidden');
                            document.querySelector('.sign-up')?.classList.add('hidden');
                            document.querySelector('.user-menu')?.classList.remove('hidden');
                            
                            // Update sidebar with user's communities
                            updateSidebar();
                        } else {
                            // User doesn't exist in Firebase anymore
                            console.warn('User no longer exists in Firebase');
                            localStorage.removeItem('redditly_user');
                            store.currentUser = null;
                            
                            // Update UI for guest user
                            document.querySelector('.login')?.classList.remove('hidden');
                            document.querySelector('.sign-up')?.classList.remove('hidden');
                            document.querySelector('.user-menu')?.classList.add('hidden');
                        }
                    })
                    .catch(error => {
                        console.error('Error verifying user:', error);
                        // Keep user logged in for offline functionality
                        store.currentUser = userData;
                        
                        // Update UI for logged in user
                        document.querySelector('.login')?.classList.add('hidden');
                        document.querySelector('.sign-up')?.classList.add('hidden');
                        document.querySelector('.user-menu')?.classList.remove('hidden');
                    });
            } else {
                // Old user data format without UID, just use it directly
                store.currentUser = userData;
                
                // Update UI for logged in user
                document.querySelector('.login')?.classList.add('hidden');
                document.querySelector('.sign-up')?.classList.add('hidden');
                document.querySelector('.user-menu')?.classList.remove('hidden');
                
                // Update sidebar with user's communities
                updateSidebar();
            }
        } catch (e) {
            console.error('Error parsing user data:', e);
            localStorage.removeItem('redditly_user');
            store.currentUser = null;
            
            // Update UI for guest user
            document.querySelector('.login')?.classList.remove('hidden');
            document.querySelector('.sign-up')?.classList.remove('hidden');
            document.querySelector('.user-menu')?.classList.add('hidden');
        }
    } else {
        // Update UI for guest user
        document.querySelector('.login')?.classList.remove('hidden');
        document.querySelector('.sign-up')?.classList.remove('hidden');
        document.querySelector('.user-menu')?.classList.add('hidden');
    }
}

/**
 * Login user using Firebase authentication
 */
function loginUser(username, password) {
    // Show loading state
    const loginButton = document.querySelector('#login-form .auth-submit-button');
    const originalText = loginButton.textContent;
    loginButton.textContent = 'Logging in...';
    loginButton.disabled = true;
    
    // Check if user exists in Firebase
    window.firebaseDB.usersRef.where('username', '==', username).get()
        .then(snapshot => {
            if (snapshot.empty) {
                throw new Error('Invalid username or password');
            }
            
            const userDoc = snapshot.docs[0];
            const userData = userDoc.data();
            
            // In a real app, we would verify password hash here
            // For demo, we'll just check if passwords match
            if (userData.password !== password) {
                throw new Error('Invalid username or password');
            }
            
            // Get user ID
            const uid = userDoc.id;
            
            // Store user in localStorage for session persistence
            const user = {
                username: userData.username,
                email: userData.email,
                uid: uid,
                avatar: userData.avatar || 'assets/default-avatar.png'
            };
            
            localStorage.setItem('redditly_user', JSON.stringify(user));
            store.currentUser = user;
            
            // Update UI
            document.querySelector('.login')?.classList.add('hidden');
            document.querySelector('.sign-up')?.classList.add('hidden');
            document.querySelector('.user-menu')?.classList.remove('hidden');
            
            // Close modal
            document.getElementById('login-modal').style.display = 'none';
            
            // Update sidebar with user's communities
            updateSidebar();
            
            // Refresh posts to show voting state for current user
            loadAndRenderPosts();
            
            // Display success message
            showNotification(`Welcome back, ${username}!`);
            
            // Reset login form
            document.getElementById('login-form').reset();
        })
        .catch(error => {
            console.error('Login error:', error);
            
            // Display error message
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = error.message || 'Failed to login. Please try again.';
            
            // Remove any existing error messages
            const existingError = document.querySelector('#login-form .error-message');
            if (existingError) existingError.remove();
            
            // Add new error message before submit button
            const submitButton = document.querySelector('#login-form .auth-submit-button');
            submitButton.parentNode.insertBefore(errorElement, submitButton);
        })
        .finally(() => {
            // Reset button state
            loginButton.textContent = originalText;
            loginButton.disabled = false;
        });
}

/**
 * Sign up user using Firebase authentication
 */
function signupUser(email, username, password) {
    // Show loading state
    const signupButton = document.querySelector('#signup-form .auth-submit-button');
    const originalText = signupButton.textContent;
    signupButton.textContent = 'Creating account...';
    signupButton.disabled = true;
    
    // Check if username already exists
    window.firebaseDB.usersRef.where('username', '==', username).get()
        .then(snapshot => {
            if (!snapshot.empty) {
                throw new Error('Username already taken');
            }
            
            // Check if email already exists
            return window.firebaseDB.usersRef.where('email', '==', email).get();
        })
        .then(snapshot => {
            if (!snapshot.empty) {
                throw new Error('Email already in use');
            }
            
            // Create new user document in Firestore
            return window.firebaseDB.usersRef.add({
                username: username,
                email: email,
                password: password, // In a real app, this would be hashed
                avatar: 'assets/default-avatar.png',
                created_at: firebase.firestore.FieldValue.serverTimestamp(),
                saved_posts: [],
                saved_comments: []
            });
        })
        .then(docRef => {
            // Store user in localStorage for session persistence
            const user = {
                username: username,
                email: email,
                uid: docRef.id,
                avatar: 'assets/default-avatar.png'
            };
            
            localStorage.setItem('redditly_user', JSON.stringify(user));
            store.currentUser = user;
            
            // Update UI
            document.querySelector('.login')?.classList.add('hidden');
            document.querySelector('.sign-up')?.classList.add('hidden');
            document.querySelector('.user-menu')?.classList.remove('hidden');
            
            // Close modal
            document.getElementById('signup-modal').style.display = 'none';
            
            // Update sidebar with user's communities
            updateSidebar();
            
            // Refresh posts to show voting state for current user
            loadAndRenderPosts();
            
            // Display success message
            showNotification(`Welcome to Redditly, ${username}!`);
            
            // Reset signup form
            document.getElementById('signup-form').reset();
        })
        .catch(error => {
            console.error('Signup error:', error);
            
            // Display error message
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = error.message || 'Failed to create account. Please try again.';
            
            // Remove any existing error messages
            const existingError = document.querySelector('#signup-form .error-message');
            if (existingError) existingError.remove();
            
            // Add new error message before submit button
            const submitButton = document.querySelector('#signup-form .auth-submit-button');
            submitButton.parentNode.insertBefore(errorElement, submitButton);
        })
        .finally(() => {
            // Reset button state
            signupButton.textContent = originalText;
            signupButton.disabled = false;
        });
}

/**
 * Set up the post form to open the create post modal when clicked
 */
function setupPostFormClick() {
    const postFormInput = document.querySelector('.post-form-input');
    
    postFormInput?.addEventListener('click', () => {
        // Check if user is logged in
        if (!store.currentUser) {
            const loginModal = document.getElementById('login-modal');
            loginModal.style.display = 'flex';
            setupModalAccessibility(loginModal);
            return;
        }
        
        // Populate communities dropdown
        populateCommunitiesDropdown();
        
        // Show the post modal
        const postModal = document.getElementById('create-post-modal');
        postModal.style.display = 'flex';
        setupModalAccessibility(postModal);
        
        // Scroll to top of modal when opened
        postModal.scrollTop = 0;
    });
}

/**
 * Populate the communities dropdown in the post creation form
 */
function populateCommunitiesDropdown() {
    const communitySelect = document.getElementById('post-community');
    // Clear existing options except the default one
    communitySelect.innerHTML = '<option value="" disabled selected>Select a community</option>';
    
    // Add subscribed communities for the current user
    const userSubscriptions = store.communities.filter(
        community => community.subscribers.includes(store.currentUser.username)
    );
    
    userSubscriptions.forEach(community => {
        const option = document.createElement('option');
        option.value = community.id;
        option.textContent = `r/${community.name}`;
        communitySelect.appendChild(option);
    });
    
    // If user has no subscriptions, show a message
    if (userSubscriptions.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'You are not subscribed to any communities';
        option.disabled = true;
        communitySelect.appendChild(option);
    }
}

/**
 * Set up community creation with enhanced UI
 */
function setupCommunityCreation() {
    // Color options for community icon
    const colorOptions = document.querySelectorAll('.color-option');
    const communityIconPreview = document.querySelector('.community-icon-preview');
    
    // Add color selection functionality
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all options
            colorOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            option.classList.add('active');
            
            // Update community icon preview
            const color = option.dataset.color;
            let gradient;
            
            switch(color) {
                case 'orange':
                    gradient = 'var(--gradient-orange)';
                    break;
                case 'purple':
                    gradient = 'var(--gradient-purple)';
                    break;
                case 'green':
                    gradient = 'linear-gradient(135deg, var(--accent-green) 0%, #0DC863 100%)';
                    break;
                case 'yellow':
                    gradient = 'linear-gradient(135deg, var(--accent-yellow) 0%, #FFC833 100%)';
                    break;
                default: // blue
                    gradient = 'var(--gradient-blue)';
            }
            
            communityIconPreview.style.background = gradient;
        });
    });

    // Create community button in sidebar
    const createCommunityLinks = document.querySelectorAll('.sidebar-menu-item a[href="#"]');
    createCommunityLinks.forEach(link => {
        if (link.querySelector('span')?.textContent === 'Create Community') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Check if user is logged in
                if (!store.currentUser) {
                    const loginModal = document.getElementById('login-modal');
                    loginModal.style.display = 'flex';
                    setupModalAccessibility(loginModal);
                    return;
                }
                
                // Reset form and error messages
                document.getElementById('create-community-form').reset();
                document.getElementById('community-error').style.display = 'none';
                document.getElementById('community-success').style.display = 'none';
                
                // Reset community icon color to default (blue)
                colorOptions.forEach(opt => opt.classList.remove('active'));
                document.querySelector('.color-option.blue').classList.add('active');
                communityIconPreview.style.background = 'var(--gradient-blue)';
                
                // Check community limit (max 2 per user)
                const userCommunities = store.communities.filter(
                    c => c.createdBy === store.currentUser.username
                );
                
                const communityForm = document.getElementById('create-community-form');
                const errorElement = document.getElementById('community-error');
                
                if (userCommunities.length >= 2) {
                    errorElement.textContent = 'You have reached the limit of 2 communities per user';
                    errorElement.style.display = 'block';
                    
                    // Add a class to make the limit more visible
                    if (!communityForm.querySelector('.limit-alert')) {
                        const limitAlert = document.createElement('div');
                        limitAlert.className = 'limit-alert';
                        limitAlert.innerHTML = '<strong>Community Limit Reached:</strong> You can create a maximum of 2 communities per account. This is a portfolio demo restriction.';
                        communityForm.insertBefore(limitAlert, communityForm.firstChild);
                    }
                } else {
                    // Clear any previous errors
                    errorElement.style.display = 'none';
                    const existingAlert = communityForm.querySelector('.limit-alert');
                    if (existingAlert) {
                        existingAlert.remove();
                    }
                }
                
                // Show the community creation modal
                const communityModal = document.getElementById('create-community-modal');
                communityModal.style.display = 'flex';
                setupModalAccessibility(communityModal);
                
                // Scroll to top of modal when opened
                communityModal.scrollTop = 0;
            });
        }
    });
    
    // Create community form validation and submission
    const communityForm = document.getElementById('create-community-form');
    const communityNameInput = document.getElementById('community-name');
    
    // Add input validation for community name
    communityNameInput?.addEventListener('input', () => {
        const nameValue = communityNameInput.value.trim();
        const errorElement = document.getElementById('community-error');
        
        // Validate the community name as user types
        if (nameValue.length < 3) {
            errorElement.textContent = 'Community name must be at least 3 characters';
            errorElement.style.display = 'block';
        } else if (nameValue.length > 21) {
            errorElement.textContent = 'Community name must be less than 21 characters';
            errorElement.style.display = 'block';
        } else if (!/^[a-zA-Z0-9_]+$/.test(nameValue)) {
            errorElement.textContent = 'Community name can only contain letters, numbers and underscores';
            errorElement.style.display = 'block';
        } else if (store.communities.some(c => c.name.toLowerCase() === nameValue.toLowerCase())) {
            errorElement.textContent = 'This community name is already taken';
            errorElement.style.display = 'block';
        } else {
            errorElement.style.display = 'none';
        }
    });
    
    communityForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!store.currentUser) return;
        
        // Check community limit again
        const userCommunities = store.communities.filter(
            c => c.createdBy === store.currentUser.username
        );
        
        if (userCommunities.length >= 2) {
            document.getElementById('community-error').textContent = 'You have reached the limit of 2 communities per user';
            document.getElementById('community-error').style.display = 'block';
            return;
        }
        
        const communityName = communityNameInput.value.trim();
        const communityDescription = document.getElementById('community-description').value.trim();
        const communityType = document.querySelector('input[name="community-type"]:checked').value;
        const communityColor = document.querySelector('.color-option.active').dataset.color || 'blue';
        
        // Final validation before submission
        const errorElement = document.getElementById('community-error');
        
        if (communityName.length < 3) {
            errorElement.textContent = 'Community name must be at least 3 characters';
            errorElement.style.display = 'block';
            return;
        }
        
        if (communityName.length > 21) {
            errorElement.textContent = 'Community name must be less than 21 characters';
            errorElement.style.display = 'block';
            return;
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(communityName)) {
            errorElement.textContent = 'Community name can only contain letters, numbers and underscores';
            errorElement.style.display = 'block';
            return;
        }
        
        if (store.communities.some(c => c.name.toLowerCase() === communityName.toLowerCase())) {
            errorElement.textContent = 'This community name is already taken';
            errorElement.style.display = 'block';
            return;
        }
        
        // Create new community
        const newCommunity = {
            id: Date.now().toString(),
            name: communityName,
            description: communityDescription,
            subscribers: [store.currentUser.username],
            createdAt: new Date().toISOString(),
            createdBy: store.currentUser.username,
            type: communityType,
            color: communityColor
        };
        
        // Add to store and save to localStorage
        store.communities.push(newCommunity);
        saveDataToLocalStorage();
        
        // Show success message instead of immediately closing
        const successElement = document.getElementById('community-success');
        successElement.textContent = `Community r/${communityName} has been created successfully!`;
        successElement.style.display = 'block';
        
        // Disable form inputs
        const formInputs = communityForm.querySelectorAll('input, textarea, button, .color-option');
        formInputs.forEach(input => {
            input.disabled = true;
        });
        
        // Close modal and reset form after delay
        setTimeout(() => {
            communityForm.reset();
            document.getElementById('create-community-modal').style.display = 'none';
            
            // Re-enable form inputs
            formInputs.forEach(input => {
                input.disabled = false;
            });
            
            // Show notification
            showNotification(`Community r/${communityName} has been created!`);
            
            // Update sidebar with new community
            updateSidebar();
        }, 2000);
    });
}

/**
 * Set up post creation with enhanced UI
 */
function setupPostCreation() {
    // Handle post type selection
    const postTypeButtons = document.querySelectorAll('.post-type-button');
    const textContentGroup = document.querySelector('.text-content-group');
    const imageUrlGroup = document.querySelector('.image-url-group');
    const linkUrlGroup = document.querySelector('.link-url-group');
    
    postTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            postTypeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show/hide relevant form fields
            const type = button.dataset.type;
            
            // Hide all content groups first
            textContentGroup.style.display = 'none';
            imageUrlGroup.style.display = 'none';
            linkUrlGroup.style.display = 'none';
            
            // Show the selected one
            if (type === 'text') {
                textContentGroup.style.display = 'block';
            } else if (type === 'image') {
                imageUrlGroup.style.display = 'block';
            } else if (type === 'link') {
                linkUrlGroup.style.display = 'block';
            }
        });
    });
    
    // Setup image preview
    const imageUrlInput = document.getElementById('post-image-url');
    const imagePreview = document.getElementById('image-preview');
    
    imageUrlInput?.addEventListener('input', () => {
        const imageUrl = imageUrlInput.value.trim();
        
        if (imageUrl) {
            // Create image element for preview
            imagePreview.innerHTML = `<img src="${imageUrl}" alt="Preview" onerror="this.onerror=null;this.src='assets/image-placeholder.png';this.alt='Unable to load image';">`;
            imagePreview.style.display = 'block';
        } else {
            imagePreview.style.display = 'none';
            imagePreview.innerHTML = '';
        }
    });
    
    // Create post form submission
    const postForm = document.getElementById('create-post-form');
    postForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!store.currentUser) return;
        
        const postTitle = document.getElementById('post-title').value.trim();
        const postContent = document.getElementById('post-content').value.trim();
        const communityId = document.getElementById('post-community').value;
        const postTypeActive = document.querySelector('.post-type-button.active').dataset.type;
        const postTags = document.getElementById('post-tags').value.trim()
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
        
        // Get additional fields based on post type
        let imageUrl = '';
        let linkUrl = '';
        
        if (postTypeActive === 'image') {
            imageUrl = document.getElementById('post-image-url').value.trim();
            if (!imageUrl) {
                document.getElementById('post-error').textContent = 'Please provide an image URL';
                document.getElementById('post-error').style.display = 'block';
                return;
            }
        } else if (postTypeActive === 'link') {
            linkUrl = document.getElementById('post-link-url').value.trim();
            if (!linkUrl) {
                document.getElementById('post-error').textContent = 'Please provide a link URL';
                document.getElementById('post-error').style.display = 'block';
                return;
            }
        } else if (postTypeActive === 'text' && !postContent) {
            document.getElementById('post-error').textContent = 'Please provide content for your post';
            document.getElementById('post-error').style.display = 'block';
            return;
        }
        
        if (!communityId) {
            document.getElementById('post-error').textContent = 'Please select a community';
            document.getElementById('post-error').style.display = 'block';
            return;
        }
        
        // Create new post
        const newPost = {
            id: Date.now().toString(),
            title: postTitle,
            type: postTypeActive,
            communityId,
            authorId: store.currentUser.username,
            author: store.currentUser.username,
            upvotes: [],
            downvotes: [],
            createdAt: new Date().toISOString(),
            comments: [],
            tags: postTags.slice(0, 5) // Limit to 5 tags
        };
        
        // Add content based on post type
        if (postTypeActive === 'text') {
            newPost.content = postContent;
        } else if (postTypeActive === 'image') {
            newPost.imageUrl = imageUrl;
        } else if (postTypeActive === 'link') {
            newPost.linkUrl = linkUrl;
        }
        
        // Show success message
        const successElement = document.getElementById('post-success');
        successElement.textContent = 'Your post has been created successfully!';
        successElement.style.display = 'block';
        
        // Disable form inputs
        const formInputs = postForm.querySelectorAll('input, textarea, select, button');
        formInputs.forEach(input => {
            input.disabled = true;
        });
        
        // Add to store and save to localStorage after a short delay
        setTimeout(() => {
            store.posts.unshift(newPost);
            saveDataToLocalStorage();
            
            // Reset form and close modal
            postForm.reset();
            document.getElementById('create-post-modal').style.display = 'none';
            
            // Re-enable form inputs
            formInputs.forEach(input => {
                input.disabled = false;
            });
            
            // Reset post type to text
            document.querySelector('.post-type-button[data-type="text"]').click();
            
            // Show success notification
            showNotification('Your post has been created!');
            
            // Reset character counters
            document.getElementById('title-char-counter').textContent = '0';
            document.getElementById('content-char-counter').textContent = '0';
            
            // Reset image preview
            imagePreview.style.display = 'none';
            imagePreview.innerHTML = '';
            
            // Hide success message
            successElement.style.display = 'none';
            
            // Reload posts
            loadAndRenderPosts();
        }, 1500);
    });
}

/**
 * Setup character counters for post creation
 */
function setupCharacterCounters() {
    const postTitleInput = document.getElementById('post-title');
    const postContentInput = document.getElementById('post-content');
    const titleCounter = document.getElementById('title-char-counter');
    const contentCounter = document.getElementById('content-char-counter');
    
    postTitleInput?.addEventListener('input', () => {
        const count = postTitleInput.value.length;
        titleCounter.textContent = count;
        
        // Visual feedback if approaching limit
        if (count > 250) {
            titleCounter.style.color = 'var(--primary-color)';
        } else {
            titleCounter.style.color = '';
        }
        
        // Hard limit at 300 characters
        if (count > 300) {
            postTitleInput.value = postTitleInput.value.substring(0, 300);
            titleCounter.textContent = '300';
        }
    });
    
    postContentInput?.addEventListener('input', () => {
        const count = postContentInput.value.length;
        contentCounter.textContent = count;
        
        // Visual feedback if approaching limit
        if (count > 9000) {
            contentCounter.style.color = 'var(--primary-color)';
        } else {
            contentCounter.style.color = '';
        }
        
        // Hard limit at 10000 characters
        if (count > 10000) {
            postContentInput.value = postContentInput.value.substring(0, 10000);
            contentCounter.textContent = '10000';
        }
    });
}

/**
 * Show a temporary notification
 */
function showNotification(message, type = 'success') {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Clear existing classes and add type class
    notification.className = 'notification';
    notification.classList.add(type);
    
    // Set message
    notification.textContent = message;
    
    // Add show class to trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * Update sidebar with communities
 */
function updateSidebar() {
    if (!store.currentUser) return;
    
    // Get communities section
    const communitiesSection = document.querySelector('.sidebar-section:nth-child(2)');
    if (!communitiesSection) return;
    
    const communityList = communitiesSection.querySelector('.sidebar-menu');
    
    // Clear existing list items except the "Create Community" one
    const createCommunityItem = communityList.querySelector('li:last-child');
    communityList.innerHTML = '';
    communityList.appendChild(createCommunityItem);
    
    // Get user's subscribed communities
    const userCommunities = store.communities.filter(
        community => community.subscribers.includes(store.currentUser.username)
    );
    
    // Add communities to the sidebar
    userCommunities.forEach(community => {
        const li = document.createElement('li');
        li.className = 'sidebar-menu-item';
        li.innerHTML = `
            <a href="#" data-community-id="${community.id}">
                <img src="assets/community-placeholder.png" alt="${community.name}" class="community-icon">
                <span>r/${community.name}</span>
            </a>
        `;
        
        // Add click handler to load posts from this community
        li.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            loadAndRenderPosts(community.id);
            
            // Update active state
            document.querySelectorAll('.sidebar-menu-item').forEach(item => {
                item.classList.remove('active');
            });
            li.classList.add('active');
        });
        
        // Insert before the "Create Community" link
        communityList.insertBefore(li, createCommunityItem);
    });
}

/**
 * Set up post links to navigate to post details page
 */
function setupPostLinks() {
    // Get all posts
    const posts = document.querySelectorAll('.post');
    
    posts.forEach(post => {
        const postId = post.dataset.postId;
        
        // Make post title clickable
        const postTitle = post.querySelector('.post-title a');
        postTitle?.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `post-details.html?id=${postId}`;
        });
        
        // Make comments button clickable
        const commentsButton = post.querySelector('.post-footer .post-action:first-child');
        commentsButton?.addEventListener('click', () => {
            window.location.href = `post-details.html?id=${postId}`;
        });
    });
}

/**
 * Load and render posts, optionally filtered by community
 */
function loadAndRenderPosts(communityId = null) {
    const postsContainer = document.querySelector('.posts');
    if (!postsContainer) return;
    
    // Filter posts if communityId is provided
    let filteredPosts = [...store.posts];
    if (communityId) {
        filteredPosts = filteredPosts.filter(post => post.communityId === communityId);
    }
    
    // Sort by newest first
    filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Clear existing posts
    postsContainer.innerHTML = '';
    
    if (filteredPosts.length === 0) {
        postsContainer.innerHTML = `
            <div class="no-posts">
                <div class="empty-state">
                    <i class="fas fa-comment-slash" style="font-size: 48px; color: var(--secondary-text); margin-bottom: 16px;"></i>
                    <p>No posts yet. Be the first to post!</p>
                    <button class="auth-submit-button" style="max-width: 200px; margin: 16px auto;">Create Post</button>
                </div>
            </div>
        `;
        
        // Add click handler to the create post button
        const createPostBtn = postsContainer.querySelector('.auth-submit-button');
        createPostBtn?.addEventListener('click', () => {
            if (!store.currentUser) {
                const loginModal = document.getElementById('login-modal');
                loginModal.style.display = 'flex';
                return;
            }
            
            populateCommunitiesDropdown();
            const postModal = document.getElementById('create-post-modal');
            postModal.style.display = 'flex';
        });
        
        return;
    }
    
    // Add staggered animation class for posts
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .post {
            animation: fadeInUp 0.3s ease-out forwards;
            animation-fill-mode: both;
        }
    `;
    document.head.appendChild(style);
    
    // Render each post
    filteredPosts.forEach((post, index) => {
        const community = store.communities.find(c => c.id === post.communityId);
        if (!community) return;
        
        // Format date
        const postDate = new Date(post.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - postDate);
        let timeDisplay;
        
        if (diffTime < 60 * 60 * 1000) {
            // Less than an hour
            timeDisplay = `${Math.floor(diffTime / (60 * 1000))} minutes ago`;
        } else if (diffTime < 24 * 60 * 60 * 1000) {
            // Less than a day
            timeDisplay = `${Math.floor(diffTime / (60 * 60 * 1000))} hours ago`;
        } else {
            // More than a day
            timeDisplay = `${Math.floor(diffTime / (24 * 60 * 60 * 1000))} days ago`;
        }
        
        // Check if user has voted
        const upvoted = store.currentUser && post.upvotes && post.upvotes.includes(store.currentUser.username);
        const downvoted = store.currentUser && post.downvotes && post.downvotes.includes(store.currentUser.username);
        
        // Calculate vote count
        const voteCount = (post.upvotes || []).length - (post.downvotes || []).length;
        
        // Create post element
        const postElement = document.createElement('article');
        postElement.className = 'post';
        postElement.dataset.postId = post.id;
        postElement.style.animationDelay = `${index * 0.1}s`;
        
        // Create content HTML based on post type
        let contentHtml = '';
        
        if (post.type === 'text' && post.content) {
            contentHtml = `<div class="post-text"><p>${post.content}</p></div>`;
        } else if (post.type === 'image' && post.imageUrl) {
            contentHtml = `<div class="post-image"><img src="${post.imageUrl}" alt="Post image"></div>`;
        } else if (post.type === 'link' && post.linkUrl) {
            contentHtml = `<div class="post-link"><a href="${post.linkUrl}" target="_blank" rel="noopener noreferrer">${post.linkUrl}</a></div>`;
        }
        
        // Check if post author is current user
        const isCurrentUser = store.currentUser && post.author === store.currentUser.username;
        const userClass = isCurrentUser ? 'current-user' : '';
        
        postElement.innerHTML = `
            <div class="post-votes">
                <button class="vote-button upvote ${upvoted ? 'active' : ''}"><i class="fas fa-arrow-up"></i></button>
                <span class="vote-count">${voteCount}</span>
                <button class="vote-button downvote ${downvoted ? 'active' : ''}"><i class="fas fa-arrow-down"></i></button>
            </div>
            <div class="post-content">
                <div class="post-header">
                    <img src="assets/community-placeholder.png" alt="${community.name}" class="post-community-icon">
                    <span class="post-community">r/${community.name}</span>
                    <span class="post-meta">Posted by <a href="#" class="${userClass}">u/${post.author}</a> ${timeDisplay}</span>
                </div>
                <h3 class="post-title">
                    <a href="#">${post.title}</a>
                </h3>
                ${contentHtml}
                <div class="post-footer">
                    <button class="post-action">
                        <i class="fas fa-message"></i>
                        <span>${post.comments ? post.comments.length : 0} Comments</span>
                    </button>
                    <button class="post-action">
                        <i class="fas fa-share"></i>
                        <span>Share</span>
                    </button>
                    <button class="post-action">
                        <i class="fas fa-bookmark"></i>
                        <span>Save</span>
                    </button>
                    <button class="post-action">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add to posts container
        postsContainer.appendChild(postElement);
    });
    
    // Re-initialize voting buttons
    setupVoting();
    
    // Set up post links
    setupPostLinks();
}

// Helper function to set up modal accessibility
function setupModalAccessibility(modal) {
    // Ensure modal is scrollable if content overflows
    const modalContent = modal.querySelector('.modal-content');
    
    // Add scroll to bottom button if needed
    if (!modal.querySelector('.scroll-to-bottom')) {
        const scrollButton = document.createElement('button');
        scrollButton.className = 'scroll-to-bottom';
        scrollButton.innerHTML = '<i class="fas fa-arrow-down"></i>';
        scrollButton.title = 'Scroll to Bottom';
        scrollButton.style.display = 'none';
        
        // Add button to modal (outside modal-content to stay fixed)
        modal.appendChild(scrollButton);
        
        // Add click handler
        scrollButton.addEventListener('click', () => {
            const form = modalContent.querySelector('form');
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                modalContent.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        });
        
        // Show/hide button based on scroll position
        modal.addEventListener('scroll', () => {
            const modalHeight = modal.clientHeight;
            const contentHeight = modalContent.offsetHeight;
            const scrollPosition = modal.scrollTop;
            
            // Show button if not near the bottom
            if (contentHeight > modalHeight && scrollPosition < contentHeight - modalHeight - 100) {
                scrollButton.style.display = 'flex';
            } else {
                scrollButton.style.display = 'none';
            }
        });
    }
    
    // Add a scroll to top button as well
    if (!modal.querySelector('.scroll-to-top')) {
        const scrollTopButton = document.createElement('button');
        scrollTopButton.className = 'scroll-to-top';
        scrollTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollTopButton.title = 'Scroll to Top';
        scrollTopButton.style.display = 'none';
        
        // Add button to modal
        modal.appendChild(scrollTopButton);
        
        // Add click handler
        scrollTopButton.addEventListener('click', () => {
            modal.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        // Show/hide button based on scroll position
        modal.addEventListener('scroll', () => {
            if (modal.scrollTop > 100) {
                scrollTopButton.style.display = 'flex';
            } else {
                scrollTopButton.style.display = 'none';
            }
        });
    }
}

/**
 * Reset data to defaults
 */
async function resetData() {
    // Clear all localStorage items related to Redditly
    localStorage.removeItem('redditly_communities');
    localStorage.removeItem('redditly_posts');
    localStorage.removeItem('redditly_comments');
    localStorage.removeItem('redditly_user');
    
    // If there are saved items from any user, remove those too
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('redditly_saved_')) {
            localStorage.removeItem(key);
        }
    });
    
    // If the user is logged in, reset their saved items in Firebase
    if (store.currentUser && store.currentUser.uid) {
        try {
            await window.firebaseDB.usersRef.doc(store.currentUser.uid).update({
                saved_posts: [],
                saved_comments: []
            });
            console.log('User data reset in Firebase');
        } catch (error) {
            console.error('Error resetting user data in Firebase:', error);
        }
    }
    
    // Re-initialize data
    initData();
    
    // Reload page
    location.reload();
}

/**
 * Set up observer for user authentication state
 */
function setupUserAuthObserver() {
    // Listen for online/offline status
    window.addEventListener('online', () => {
        console.log('Online - syncing data with Firebase');
        showNotification('You are back online. Syncing data...', 'success');
        saveDataToStorage();
    });
    
    window.addEventListener('offline', () => {
        console.log('Offline - using local data only');
        showNotification('You are offline. Changes will be saved locally.', 'warning');
    });
    
    // Update UI elements that show user state
    document.addEventListener('click', (e) => {
        // Update username displays
        const usernameDisplays = document.querySelectorAll('.user-username');
        if (store.currentUser && usernameDisplays) {
            usernameDisplays.forEach(display => {
                display.textContent = store.currentUser.username;
            });
        }
    });
}

/**
 * Initialize the application
 */
function init() {
    // Initialize data
    initData();
    
    // Initialize user state
    initUserState();
    
    // Set up user auth observer
    setupUserAuthObserver();
    
    // Set up interactive features
    setupModals();
    setupVoting();
    setupTabs();
    setupMobileOptimizations();
    setupPostFormClick();
    setupCommunityCreation();
    setupPostCreation();
    setupCharacterCounters();
    
    // Update UI
    updateSidebar();
    
    // Load posts with filter if specified
    const urlParams = new URLSearchParams(window.location.search);
    const communityId = urlParams.get('community');
    loadAndRenderPosts(communityId);
    
    // Setup reset data button
    const resetDataButton = document.getElementById('reset-data-button');
    resetDataButton?.addEventListener('click', () => {
        if (confirm('This will reset all data to default values. Are you sure?')) {
            resetData();
        }
    });
} 