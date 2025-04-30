document.addEventListener('DOMContentLoaded', () => {
    // Initialize user state
    initUserState();
    
    // Set up modal handlers
    setupModals();
    
    // Load saved content
    loadSavedContent();
    
    // Set up tab switching
    setupTabSwitching();
});

/**
 * Initialize user state (logged in or not)
 */
function initUserState() {
    // Check if user is logged in
    const userJson = localStorage.getItem('redditly_user');
    
    if (userJson) {
        try {
            store.currentUser = JSON.parse(userJson);
            
            // Update UI for logged in user
            document.querySelector('.login')?.classList.add('hidden');
            document.querySelector('.sign-up')?.classList.add('hidden');
            document.querySelector('.user-menu')?.classList.remove('hidden');
        } catch (e) {
            console.error('Error parsing user data:', e);
            localStorage.removeItem('redditly_user');
            store.currentUser = null;
        }
    } else {
        // Update UI for guest user
        document.querySelector('.login')?.classList.remove('hidden');
        document.querySelector('.sign-up')?.classList.remove('hidden');
        document.querySelector('.user-menu')?.classList.add('hidden');
        
        // Show login modal for guests
        const loginModal = document.getElementById('login-modal');
        loginModal.style.display = 'flex';
        setupModalAccessibility(loginModal);
    }
}

/**
 * Global store for data
 */
const store = {
    currentUser: null,
    savedPosts: [],
    savedComments: [],
    posts: [],
    comments: [],
    communities: []
};

/**
 * Load data from localStorage
 */
function loadSavedContent() {
    if (!store.currentUser) return;
    
    // Load all necessary data
    store.posts = JSON.parse(localStorage.getItem('redditly_posts')) || [];
    store.comments = JSON.parse(localStorage.getItem('redditly_comments')) || [];
    store.communities = JSON.parse(localStorage.getItem('redditly_communities')) || [];
    store.savedPosts = JSON.parse(localStorage.getItem(`redditly_saved_posts_${store.currentUser.username}`)) || [];
    store.savedComments = JSON.parse(localStorage.getItem(`redditly_saved_comments_${store.currentUser.username}`)) || [];
    
    renderSavedPosts();
    renderSavedComments();
}

/**
 * Render saved posts in the UI
 */
function renderSavedPosts() {
    const container = document.getElementById('saved-posts-content');
    
    if (store.savedPosts.length === 0) {
        container.innerHTML = `
            <div class="saved-empty">
                <i class="fas fa-bookmark"></i>
                <p>You haven't saved any posts yet.</p>
                <p>When you save a post, you'll find it here.</p>
                <a href="index.html" class="auth-submit-button" style="display: inline-block; max-width: 200px; margin: 0 auto;">Browse Posts</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    // Get all the full post data for each saved post ID
    const fullPosts = store.savedPosts.map(savedPostId => {
        return store.posts.find(post => post.id === savedPostId);
    }).filter(post => post !== undefined); // Filter out any not found
    
    // Render each post
    fullPosts.forEach(post => {
        const community = store.communities.find(c => c.id === post.communityId);
        if (!community) return;
        
        // Format the date
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
        
        // Count upvotes and downvotes
        const voteCount = (post.upvotes || []).length - (post.downvotes || []).length;
        
        // Create post HTML
        const postElement = document.createElement('article');
        postElement.className = 'post';
        postElement.dataset.postId = post.id;
        
        let contentHtml = '';
        if (post.type === 'text' && post.content) {
            contentHtml = `<div class="post-text"><p>${post.content}</p></div>`;
        } else if (post.type === 'image' && post.imageUrl) {
            contentHtml = `<div class="post-image"><img src="${post.imageUrl}" alt="Post image" loading="lazy"></div>`;
        } else if (post.type === 'link' && post.linkUrl) {
            contentHtml = `<div class="post-link"><a href="${post.linkUrl}" target="_blank" rel="noopener noreferrer">${post.linkUrl}</a></div>`;
        }
        
        postElement.innerHTML = `
            <div class="post-votes">
                <button class="vote-button upvote" title="Upvote"><i class="fas fa-arrow-up"></i></button>
                <span class="vote-count">${voteCount}</span>
                <button class="vote-button downvote" title="Downvote"><i class="fas fa-arrow-down"></i></button>
            </div>
            <div class="post-content">
                <div class="post-header">
                    <img src="assets/community-placeholder.png" alt="${community.name}" class="post-community-icon">
                    <span class="post-community">r/${community.name}</span>
                    <span class="post-meta">Posted by <a href="#">u/${post.author}</a> ${timeDisplay}</span>
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
                    <button class="post-action saved" onclick="unsavePost('${post.id}')">
                        <i class="fas fa-bookmark"></i>
                        <span>Unsave</span>
                    </button>
                    <button class="post-action">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(postElement);
    });
    
    // Set up voting on saved posts
    setupVoting();
}

/**
 * Render saved comments in the UI
 */
function renderSavedComments() {
    const container = document.getElementById('saved-comments-content');
    
    if (store.savedComments.length === 0) {
        container.innerHTML = `
            <div class="saved-empty">
                <i class="fas fa-comment-dots"></i>
                <p>You haven't saved any comments yet.</p>
                <p>When you save a comment, you'll find it here.</p>
                <a href="index.html" class="auth-submit-button" style="display: inline-block; max-width: 200px; margin: 0 auto;">Browse Comments</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    // Get all the full comment data for each saved comment ID
    const fullComments = store.savedComments.map(savedCommentId => {
        return store.comments.find(comment => comment.id === savedCommentId);
    }).filter(comment => comment !== undefined); // Filter out any not found
    
    // Render each comment
    fullComments.forEach(comment => {
        const post = store.posts.find(p => p.id === comment.postId);
        if (!post) return;
        
        const community = store.communities.find(c => c.id === post.communityId);
        if (!community) return;
        
        // Format the date
        const commentDate = new Date(comment.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - commentDate);
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
        
        // Count upvotes and downvotes
        const voteCount = (comment.upvotes || []).length - (comment.downvotes || []).length;
        
        // Create comment HTML
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.dataset.commentId = comment.id;
        
        commentElement.innerHTML = `
            <div class="comment-context">
                <a href="#" class="comment-post-link">From post: ${post.title}</a>
                <span class="comment-community">in r/${community.name}</span>
            </div>
            <div class="comment-header">
                <span class="comment-author">u/${comment.author}</span>
                <span class="comment-time">${timeDisplay}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
            <div class="comment-actions">
                <div class="comment-votes">
                    <button class="comment-vote-button upvote" title="Upvote"><i class="fas fa-arrow-up"></i></button>
                    <span class="comment-vote-count">${voteCount}</span>
                    <button class="comment-vote-button downvote" title="Downvote"><i class="fas fa-arrow-down"></i></button>
                </div>
                <button class="comment-action">
                    <i class="fas fa-reply"></i>
                    <span>Reply</span>
                </button>
                <button class="comment-action saved" onclick="unsaveComment('${comment.id}')">
                    <i class="fas fa-bookmark"></i>
                    <span>Unsave</span>
                </button>
            </div>
        `;
        
        container.appendChild(commentElement);
    });
    
    // Set up comment actions
    setupCommentActions();
}

/**
 * Set up tab switching between posts and comments
 */
function setupTabSwitching() {
    const tabs = document.querySelectorAll('.saved-tab');
    const postsContent = document.getElementById('saved-posts-content');
    const commentsContent = document.getElementById('saved-comments-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding content
            const tabType = tab.dataset.tab;
            if (tabType === 'posts') {
                postsContent.style.display = 'block';
                commentsContent.style.display = 'none';
            } else {
                postsContent.style.display = 'none';
                commentsContent.style.display = 'block';
            }
        });
    });
}

/**
 * Set up comment actions like voting and replying
 */
function setupCommentActions() {
    // Upvote and downvote buttons
    const upvoteButtons = document.querySelectorAll('.comment-vote-button.upvote');
    const downvoteButtons = document.querySelectorAll('.comment-vote-button.downvote');
    
    upvoteButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Check if user is logged in
            if (!store.currentUser) {
                const loginModal = document.getElementById('login-modal');
                loginModal.style.display = 'flex';
                setupModalAccessibility(loginModal);
                return;
            }
            
            const comment = button.closest('.comment');
            const commentId = comment.dataset.commentId;
            const voteCount = comment.querySelector('.comment-vote-count');
            const downvoteButton = comment.querySelector('.downvote');
            
            // Find the comment in store
            const storeComment = store.comments.find(c => c.id === commentId);
            if (!storeComment) return;
            
            // Initialize arrays if they don't exist
            if (!storeComment.upvotes) storeComment.upvotes = [];
            if (!storeComment.downvotes) storeComment.downvotes = [];
            
            // Toggle active state with visual feedback
            button.style.transform = 'scale(1.2)';
            setTimeout(() => { button.style.transform = ''; }, 200);
            
            if (button.classList.contains('active')) {
                // Remove upvote
                button.classList.remove('active');
                storeComment.upvotes = storeComment.upvotes.filter(id => id !== store.currentUser.username);
                voteCount.textContent = parseInt(voteCount.textContent) - 1;
                
                // Animate vote count
                voteCount.style.color = '';
                voteCount.style.transform = 'scale(0.8)';
                setTimeout(() => { voteCount.style.transform = ''; }, 200);
            } else {
                // Add upvote
                button.classList.add('active');
                if (!storeComment.upvotes.includes(store.currentUser.username)) {
                    storeComment.upvotes.push(store.currentUser.username);
                }
                voteCount.textContent = parseInt(voteCount.textContent) + 1;
                
                // Animate vote count
                voteCount.style.color = 'var(--upvote-color)';
                voteCount.style.transform = 'scale(1.2)';
                setTimeout(() => { voteCount.style.transform = ''; }, 200);
                
                // Remove downvote if it exists
                if (downvoteButton.classList.contains('active')) {
                    downvoteButton.classList.remove('active');
                    storeComment.downvotes = storeComment.downvotes.filter(id => id !== store.currentUser.username);
                    voteCount.textContent = parseInt(voteCount.textContent) + 1;
                }
            }
            
            // Save to localStorage
            localStorage.setItem('redditly_comments', JSON.stringify(store.comments));
        });
    });
    
    downvoteButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Similar implementation as upvote but for downvotes
            if (!store.currentUser) {
                const loginModal = document.getElementById('login-modal');
                loginModal.style.display = 'flex';
                setupModalAccessibility(loginModal);
                return;
            }
            
            const comment = button.closest('.comment');
            const commentId = comment.dataset.commentId;
            const voteCount = comment.querySelector('.comment-vote-count');
            const upvoteButton = comment.querySelector('.upvote');
            
            // Visual feedback
            button.style.transform = 'scale(1.2)';
            setTimeout(() => { button.style.transform = ''; }, 200);
            
            // Find the comment in store
            const storeComment = store.comments.find(c => c.id === commentId);
            if (!storeComment) return;
            
            // Initialize arrays if they don't exist
            if (!storeComment.upvotes) storeComment.upvotes = [];
            if (!storeComment.downvotes) storeComment.downvotes = [];
            
            // Toggle active state
            if (button.classList.contains('active')) {
                // Remove downvote
                button.classList.remove('active');
                storeComment.downvotes = storeComment.downvotes.filter(id => id !== store.currentUser.username);
                voteCount.textContent = parseInt(voteCount.textContent) + 1;
                
                // Animate vote count
                voteCount.style.color = '';
                voteCount.style.transform = 'scale(1.2)';
                setTimeout(() => { voteCount.style.transform = ''; }, 200);
            } else {
                // Add downvote
                button.classList.add('active');
                if (!storeComment.downvotes.includes(store.currentUser.username)) {
                    storeComment.downvotes.push(store.currentUser.username);
                }
                voteCount.textContent = parseInt(voteCount.textContent) - 1;
                
                // Animate vote count
                voteCount.style.color = 'var(--downvote-color)';
                voteCount.style.transform = 'scale(0.8)';
                setTimeout(() => { voteCount.style.transform = ''; }, 200);
                
                // Remove upvote if it exists
                if (upvoteButton.classList.contains('active')) {
                    upvoteButton.classList.remove('active');
                    storeComment.upvotes = storeComment.upvotes.filter(id => id !== store.currentUser.username);
                    voteCount.textContent = parseInt(voteCount.textContent) - 1;
                }
            }
            
            // Save to localStorage
            localStorage.setItem('redditly_comments', JSON.stringify(store.comments));
        });
    });
}

/**
 * Unsave a post
 */
function unsavePost(postId) {
    if (!store.currentUser) return;
    
    // Remove from saved posts
    store.savedPosts = store.savedPosts.filter(id => id !== postId);
    
    // Save to localStorage
    localStorage.setItem(`redditly_saved_posts_${store.currentUser.username}`, JSON.stringify(store.savedPosts));
    
    // Show notification
    showNotification('Post removed from saved items');
    
    // Re-render saved posts
    renderSavedPosts();
}

/**
 * Unsave a comment
 */
function unsaveComment(commentId) {
    if (!store.currentUser) return;
    
    // Remove from saved comments
    store.savedComments = store.savedComments.filter(id => id !== commentId);
    
    // Save to localStorage
    localStorage.setItem(`redditly_saved_comments_${store.currentUser.username}`, JSON.stringify(store.savedComments));
    
    // Show notification
    showNotification('Comment removed from saved items');
    
    // Re-render saved comments
    renderSavedComments();
}

/**
 * Show a notification message
 */
function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
        
        // Add styles if not already in CSS
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                bottom: 20px;
                left: 20px;
                background-color: var(--button-blue);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                z-index: 9999;
                transform: translateY(100px);
                opacity: 0;
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
                            opacity 0.3s ease;
                font-weight: 500;
            }
            .notification.show {
                transform: translateY(0);
                opacity: 1;
            }
            .notification::before {
                content: '';
                display: inline-block;
                width: 18px;
                height: 18px;
                background-color: white;
                border-radius: 50%;
                margin-right: 8px;
                vertical-align: middle;
                background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="%230079D3" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>');
                background-size: 90%;
                background-position: center;
                background-repeat: no-repeat;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Set message and show
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Make unsave functions globally available
window.unsavePost = unsavePost;
window.unsaveComment = unsaveComment; 