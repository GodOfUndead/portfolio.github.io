/**
 * Post Details Page JavaScript
 * Handles displaying post details and comments
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the page
    initPage();
});

/**
 * Initialize the page with data
 */
function initPage() {
    // Get post ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    if (!postId) {
        // No post ID found, redirect to home
        window.location.href = 'index.html';
        return;
    }
    
    // Load data from localStorage
    loadData();
    
    // Initialize user state
    initUserState();
    
    // Set up modals
    setupModals();
    
    // Load post details
    loadPostDetails(postId);
    
    // Set up comment submission
    setupCommentForm(postId);
    
    // Set up comment sorting
    setupCommentSorting();
}

/**
 * Load data from localStorage
 */
function loadData() {
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
 * Initialize user state
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
    }
}

/**
 * Set up modals
 */
function setupModals() {
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const loginButton = document.querySelector('.login');
    const signUpButton = document.querySelector('.sign-up');
    const closeButtons = document.querySelectorAll('.close-modal');
    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToLogin = document.getElementById('switch-to-login');
    
    // Setup modal open events
    loginButton?.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });
    
    signUpButton?.addEventListener('click', () => {
        signupModal.style.display = 'flex';
    });
    
    // Setup modal close events
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            loginModal.style.display = 'none';
            signupModal.style.display = 'none';
        });
    });
    
    // Switch between modals
    switchToSignup?.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        signupModal.style.display = 'flex';
    });
    
    switchToLogin?.addEventListener('click', (e) => {
        e.preventDefault();
        signupModal.style.display = 'none';
        loginModal.style.display = 'flex';
    });
}

/**
 * Load post details
 * @param {string} postId - Post ID to load
 */
function loadPostDetails(postId) {
    // Find post in store
    const post = store.posts.find(p => p.id === postId);
    
    if (!post) {
        showNotification('Post not found', 'error');
        window.location.href = 'index.html';
        return;
    }
    
    // Find community
    const community = store.communities.find(c => c.id === post.communityId);
    
    if (!community) {
        showNotification('Community not found', 'error');
        window.location.href = 'index.html';
        return;
    }
    
    // Update page title
    document.title = `${post.title} - Redditly`;
    
    // Render post
    renderPost(post, community);
    
    // Update community sidebar
    updateCommunitySidebar(community);
    
    // Load comments
    loadComments(postId);
    
    // Populate communities list in sidebar
    populateCommunities();
}

/**
 * Render post
 * @param {Object} post - Post to render
 * @param {Object} community - Community the post belongs to
 */
function renderPost(post, community) {
    const postContainer = document.querySelector('.post-container');
    
    if (!postContainer) return;
    
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
    
    // Create content HTML
    let contentHtml = '';
    
    if (post.type === 'text' && post.content) {
        contentHtml = `<div class="post-text"><p>${post.content}</p></div>`;
    } else if (post.type === 'image' && post.imageUrl) {
        contentHtml = `<div class="post-image"><img src="${post.imageUrl}" alt="Post image"></div>`;
    } else if (post.type === 'link' && post.linkUrl) {
        contentHtml = `<div class="post-link"><a href="${post.linkUrl}" target="_blank" rel="noopener noreferrer">${post.linkUrl}</a></div>`;
    }
    
    // Check if post is saved
    const isSaved = store.currentUser && store.savedPosts.includes(post.id);
    
    // Create post HTML
    const postElement = document.createElement('article');
    postElement.className = 'post';
    postElement.dataset.postId = post.id;
    
    postElement.innerHTML = `
        <div class="post-votes">
            <button class="vote-button upvote ${upvoted ? 'active' : ''}" title="Upvote"><i class="fas fa-arrow-up"></i></button>
            <span class="vote-count">${voteCount}</span>
            <button class="vote-button downvote ${downvoted ? 'active' : ''}" title="Downvote"><i class="fas fa-arrow-down"></i></button>
        </div>
        <div class="post-content">
            <div class="post-header">
                <img src="assets/community-placeholder.png" alt="${community.name}" class="post-community-icon">
                <span class="post-community">r/${community.name}</span>
                <span class="post-meta">Posted by <a href="#">u/${post.author}</a> ${timeDisplay}</span>
            </div>
            <h2 class="post-title">${post.title}</h2>
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
                <button class="post-action save-button ${isSaved ? 'saved' : ''}" data-post-id="${post.id}">
                    <i class="fas fa-bookmark"></i>
                    <span>${isSaved ? 'Unsave' : 'Save'}</span>
                </button>
                <button class="post-action">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </div>
        </div>
    `;
    
    // Add to container
    postContainer.innerHTML = '';
    postContainer.appendChild(postElement);
    
    // Setup post actions
    setupPostActions(post.id);
}

/**
 * Update community sidebar
 * @param {Object} community - Community to display
 */
function updateCommunitySidebar(community) {
    const descriptionElement = document.getElementById('community-description');
    const membersElement = document.getElementById('community-members');
    const onlineElement = document.getElementById('community-online');
    
    if (descriptionElement) {
        descriptionElement.textContent = community.description || 'No description available';
    }
    
    if (membersElement) {
        membersElement.textContent = community.subscribers ? community.subscribers.length : 0;
    }
    
    if (onlineElement) {
        // Simulate online users (random percentage of total subscribers)
        const totalSubs = community.subscribers ? community.subscribers.length : 0;
        const onlineUsers = Math.floor(totalSubs * (Math.random() * 0.3 + 0.1));
        onlineElement.textContent = onlineUsers;
    }
    
    // Populate related communities
    populateRelatedCommunities(community.id);
}

/**
 * Populate communities list in sidebar
 */
function populateCommunities() {
    const communitiesList = document.getElementById('communities-list');
    
    if (!communitiesList) return;
    
    // Clear existing list
    communitiesList.innerHTML = '';
    
    // Add communities
    store.communities.forEach(community => {
        const listItem = document.createElement('li');
        listItem.className = 'sidebar-menu-item';
        
        listItem.innerHTML = `
            <a href="index.html?community=${community.id}">
                <img src="assets/community-placeholder.png" alt="${community.name}" class="community-icon">
                <span>r/${community.name}</span>
            </a>
        `;
        
        communitiesList.appendChild(listItem);
    });
    
    // Add create community item
    const createItem = document.createElement('li');
    createItem.className = 'sidebar-menu-item create-community-item';
    
    createItem.innerHTML = `
        <a href="#">
            <i class="fas fa-plus"></i>
            <span>Create Community</span>
        </a>
    `;
    
    communitiesList.appendChild(createItem);
}

/**
 * Populate related communities
 * @param {string} currentCommunityId - Current community ID
 */
function populateRelatedCommunities(currentCommunityId) {
    const relatedList = document.getElementById('related-communities');
    
    if (!relatedList) return;
    
    // Clear existing list
    relatedList.innerHTML = '';
    
    // Get other communities (excluding current)
    const otherCommunities = store.communities.filter(c => c.id !== currentCommunityId);
    
    // Shuffle and take up to 3
    const relatedCommunities = otherCommunities
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
    
    if (relatedCommunities.length === 0) {
        relatedList.innerHTML = '<p class="empty-message">No related communities found</p>';
        return;
    }
    
    // Add communities
    relatedCommunities.forEach(community => {
        const listItem = document.createElement('li');
        listItem.className = 'trending-item';
        
        listItem.innerHTML = `
            <img src="assets/community-placeholder.png" alt="${community.name}" class="trending-icon">
            <div class="trending-info">
                <h3>r/${community.name}</h3>
                <p>${community.subscribers ? community.subscribers.length : 0} members</p>
            </div>
            <button class="join-button">Join</button>
        `;
        
        relatedList.appendChild(listItem);
    });
}

/**
 * Setup post actions
 * @param {string} postId - Post ID
 */
function setupPostActions(postId) {
    const post = document.querySelector(`.post[data-post-id="${postId}"]`);
    if (!post) return;
    
    // Get vote buttons
    const upvoteBtn = post.querySelector('.upvote');
    const downvoteBtn = post.querySelector('.downvote');
    const saveBtn = post.querySelector('.save-button');
    
    // Setup upvote
    upvoteBtn?.addEventListener('click', () => {
        if (!store.currentUser) {
            const loginModal = document.getElementById('login-modal');
            loginModal.style.display = 'flex';
            return;
        }
        
        const postObj = store.posts.find(p => p.id === postId);
        if (!postObj) return;
        
        // Initialize arrays if they don't exist
        if (!postObj.upvotes) postObj.upvotes = [];
        if (!postObj.downvotes) postObj.downvotes = [];
        
        const alreadyUpvoted = postObj.upvotes.includes(store.currentUser.username);
        
        if (alreadyUpvoted) {
            // Remove upvote
            postObj.upvotes = postObj.upvotes.filter(username => username !== store.currentUser.username);
            upvoteBtn.classList.remove('active');
        } else {
            // Add upvote
            postObj.upvotes.push(store.currentUser.username);
            upvoteBtn.classList.add('active');
            
            // Remove downvote if exists
            if (postObj.downvotes.includes(store.currentUser.username)) {
                postObj.downvotes = postObj.downvotes.filter(username => username !== store.currentUser.username);
                downvoteBtn.classList.remove('active');
            }
            
            // Show confetti effect
            const rect = upvoteBtn.getBoundingClientRect();
            createConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
        
        // Update vote count
        const voteCount = post.querySelector('.vote-count');
        voteCount.textContent = postObj.upvotes.length - postObj.downvotes.length;
        
        // Save to localStorage
        localStorage.setItem('redditly_posts', JSON.stringify(store.posts));
    });
    
    // Setup downvote
    downvoteBtn?.addEventListener('click', () => {
        if (!store.currentUser) {
            const loginModal = document.getElementById('login-modal');
            loginModal.style.display = 'flex';
            return;
        }
        
        const postObj = store.posts.find(p => p.id === postId);
        if (!postObj) return;
        
        // Initialize arrays if they don't exist
        if (!postObj.upvotes) postObj.upvotes = [];
        if (!postObj.downvotes) postObj.downvotes = [];
        
        const alreadyDownvoted = postObj.downvotes.includes(store.currentUser.username);
        
        if (alreadyDownvoted) {
            // Remove downvote
            postObj.downvotes = postObj.downvotes.filter(username => username !== store.currentUser.username);
            downvoteBtn.classList.remove('active');
        } else {
            // Add downvote
            postObj.downvotes.push(store.currentUser.username);
            downvoteBtn.classList.add('active');
            
            // Remove upvote if exists
            if (postObj.upvotes.includes(store.currentUser.username)) {
                postObj.upvotes = postObj.upvotes.filter(username => username !== store.currentUser.username);
                upvoteBtn.classList.remove('active');
            }
        }
        
        // Update vote count
        const voteCount = post.querySelector('.vote-count');
        voteCount.textContent = postObj.upvotes.length - postObj.downvotes.length;
        
        // Save to localStorage
        localStorage.setItem('redditly_posts', JSON.stringify(store.posts));
    });
    
    // Setup save button
    saveBtn?.addEventListener('click', () => {
        if (!store.currentUser) {
            const loginModal = document.getElementById('login-modal');
            loginModal.style.display = 'flex';
            return;
        }
        
        // Check if already saved
        const isSaved = store.savedPosts.includes(postId);
        
        if (isSaved) {
            // Unsave post
            store.savedPosts = store.savedPosts.filter(id => id !== postId);
            saveBtn.classList.remove('saved');
            saveBtn.querySelector('span').textContent = 'Save';
            showNotification('Post unsaved');
        } else {
            // Save post
            store.savedPosts.push(postId);
            saveBtn.classList.add('saved');
            saveBtn.querySelector('span').textContent = 'Unsave';
            showNotification('Post saved');
        }
        
        // Save to localStorage
        localStorage.setItem(`redditly_saved_posts_${store.currentUser.username}`, JSON.stringify(store.savedPosts));
    });
}

/**
 * Load comments for a post
 * @param {string} postId - Post ID
 */
function loadComments(postId) {
    // Find comments for this post
    const postComments = store.comments.filter(comment => comment.postId === postId);
    
    // Update comments count
    const commentsCount = document.getElementById('comments-count');
    if (commentsCount) {
        commentsCount.textContent = postComments.length;
    }
    
    // Render comments
    renderComments(postComments);
}

/**
 * Render comments
 * @param {Array} comments - Comments to render
 */
function renderComments(comments) {
    const commentsList = document.querySelector('.comments-list');
    
    if (!commentsList) return;
    
    // Clear existing comments
    commentsList.innerHTML = '';
    
    if (comments.length === 0) {
        commentsList.innerHTML = `
            <div class="no-comments">
                <p>No comments yet. Be the first to comment!</p>
            </div>
        `;
        return;
    }
    
    // Render each comment
    comments.forEach(comment => {
        // Format date
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
        
        // Check if user has voted
        const upvoted = store.currentUser && comment.upvotes && comment.upvotes.includes(store.currentUser.username);
        const downvoted = store.currentUser && comment.downvotes && comment.downvotes.includes(store.currentUser.username);
        
        // Calculate vote count
        const voteCount = (comment.upvotes || []).length - (comment.downvotes || []).length;
        
        // Check if comment is saved
        const isSaved = store.currentUser && store.savedComments.includes(comment.id);
        
        // Create comment element
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.dataset.commentId = comment.id;
        
        commentElement.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">u/${comment.author}</span>
                <span class="comment-time">${timeDisplay}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
            <div class="comment-actions">
                <div class="comment-votes">
                    <button class="comment-vote-button upvote ${upvoted ? 'active' : ''}" title="Upvote"><i class="fas fa-arrow-up"></i></button>
                    <span class="comment-vote-count">${voteCount}</span>
                    <button class="comment-vote-button downvote ${downvoted ? 'active' : ''}" title="Downvote"><i class="fas fa-arrow-down"></i></button>
                </div>
                <button class="comment-action reply-button">
                    <i class="fas fa-reply"></i>
                    <span>Reply</span>
                </button>
                <button class="comment-action save-button ${isSaved ? 'saved' : ''}" data-comment-id="${comment.id}">
                    <i class="fas fa-bookmark"></i>
                    <span>${isSaved ? 'Unsave' : 'Save'}</span>
                </button>
            </div>
        `;
        
        commentsList.appendChild(commentElement);
    });
    
    // Setup comment actions
    setupCommentActions();
}

/**
 * Setup comment form
 * @param {string} postId - Post ID
 */
function setupCommentForm(postId) {
    const commentForm = document.querySelector('.comment-form');
    const commentInput = document.getElementById('comment-input');
    const commentSubmit = document.getElementById('comment-submit');
    
    if (!commentForm || !commentInput || !commentSubmit) return;
    
    // Set up submit handler
    commentSubmit.addEventListener('click', () => {
        // Check if user is logged in
        if (!store.currentUser) {
            const loginModal = document.getElementById('login-modal');
            loginModal.style.display = 'flex';
            return;
        }
        
        // Get comment content
        const content = commentInput.value.trim();
        
        if (!content) {
            showNotification('Comment cannot be empty', 'error');
            return;
        }
        
        // Create new comment
        const newComment = {
            id: Date.now().toString(), // Simple unique ID
            content,
            authorId: store.currentUser.id,
            author: store.currentUser.username,
            postId,
            upvotes: [],
            downvotes: [],
            createdAt: new Date().toISOString()
        };
        
        // Add to comments array
        store.comments.push(newComment);
        
        // Update post comments array
        const post = store.posts.find(p => p.id === postId);
        if (post) {
            if (!post.comments) {
                post.comments = [];
            }
            post.comments.push(newComment.id);
        }
        
        // Save to localStorage
        localStorage.setItem('redditly_comments', JSON.stringify(store.comments));
        localStorage.setItem('redditly_posts', JSON.stringify(store.posts));
        
        // Clear input
        commentInput.value = '';
        
        // Show notification
        showNotification('Comment added successfully');
        
        // Reload comments
        loadComments(postId);
    });
}

/**
 * Setup comment sorting
 */
function setupCommentSorting() {
    const sortLinks = document.querySelectorAll('.sort-dropdown-content a');
    const sortButton = document.querySelector('.sort-dropdown-button span');
    
    if (!sortLinks.length || !sortButton) return;
    
    // Set up sort handler
    sortLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            
            // Get sort type
            const sortType = link.dataset.sort;
            
            // Update button text
            sortButton.textContent = sortType.charAt(0).toUpperCase() + sortType.slice(1);
            
            // Get post ID
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('id');
            
            if (!postId) return;
            
            // Get comments for this post
            let comments = store.comments.filter(comment => comment.postId === postId);
            
            // Sort comments
            switch (sortType) {
                case 'top':
                    // Sort by votes (highest first)
                    comments.sort((a, b) => {
                        const aVotes = (a.upvotes || []).length - (a.downvotes || []).length;
                        const bVotes = (b.upvotes || []).length - (b.downvotes || []).length;
                        return bVotes - aVotes;
                    });
                    break;
                case 'new':
                    // Sort by date (newest first)
                    comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
                case 'old':
                    // Sort by date (oldest first)
                    comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    break;
                case 'controversial':
                    // Sort by most downvotes
                    comments.sort((a, b) => (b.downvotes || []).length - (a.downvotes || []).length);
                    break;
            }
            
            // Render sorted comments
            renderComments(comments);
        });
    });
}

/**
 * Set up comment actions like voting and saving
 */
function setupCommentActions() {
    const comments = document.querySelectorAll('.comment');
    
    comments.forEach(comment => {
        const commentId = comment.dataset.commentId;
        const upvoteBtn = comment.querySelector('.upvote');
        const downvoteBtn = comment.querySelector('.downvote');
        const saveBtn = comment.querySelector('.save-button');
        
        // Setup upvote
        upvoteBtn?.addEventListener('click', () => {
            if (!store.currentUser) {
                const loginModal = document.getElementById('login-modal');
                loginModal.style.display = 'flex';
                return;
            }
            
            const commentObj = store.comments.find(c => c.id === commentId);
            if (!commentObj) return;
            
            // Initialize arrays if they don't exist
            if (!commentObj.upvotes) commentObj.upvotes = [];
            if (!commentObj.downvotes) commentObj.downvotes = [];
            
            const alreadyUpvoted = commentObj.upvotes.includes(store.currentUser.username);
            
            if (alreadyUpvoted) {
                // Remove upvote
                commentObj.upvotes = commentObj.upvotes.filter(username => username !== store.currentUser.username);
                upvoteBtn.classList.remove('active');
            } else {
                // Add upvote
                commentObj.upvotes.push(store.currentUser.username);
                upvoteBtn.classList.add('active');
                
                // Remove downvote if exists
                if (commentObj.downvotes.includes(store.currentUser.username)) {
                    commentObj.downvotes = commentObj.downvotes.filter(username => username !== store.currentUser.username);
                    downvoteBtn.classList.remove('active');
                }
            }
            
            // Update vote count
            const voteCount = comment.querySelector('.comment-vote-count');
            voteCount.textContent = commentObj.upvotes.length - commentObj.downvotes.length;
            
            // Save to localStorage
            localStorage.setItem('redditly_comments', JSON.stringify(store.comments));
        });
        
        // Setup downvote
        downvoteBtn?.addEventListener('click', () => {
            if (!store.currentUser) {
                const loginModal = document.getElementById('login-modal');
                loginModal.style.display = 'flex';
                return;
            }
            
            const commentObj = store.comments.find(c => c.id === commentId);
            if (!commentObj) return;
            
            // Initialize arrays if they don't exist
            if (!commentObj.upvotes) commentObj.upvotes = [];
            if (!commentObj.downvotes) commentObj.downvotes = [];
            
            const alreadyDownvoted = commentObj.downvotes.includes(store.currentUser.username);
            
            if (alreadyDownvoted) {
                // Remove downvote
                commentObj.downvotes = commentObj.downvotes.filter(username => username !== store.currentUser.username);
                downvoteBtn.classList.remove('active');
            } else {
                // Add downvote
                commentObj.downvotes.push(store.currentUser.username);
                downvoteBtn.classList.add('active');
                
                // Remove upvote if exists
                if (commentObj.upvotes.includes(store.currentUser.username)) {
                    commentObj.upvotes = commentObj.upvotes.filter(username => username !== store.currentUser.username);
                    upvoteBtn.classList.remove('active');
                }
            }
            
            // Update vote count
            const voteCount = comment.querySelector('.comment-vote-count');
            voteCount.textContent = commentObj.upvotes.length - commentObj.downvotes.length;
            
            // Save to localStorage
            localStorage.setItem('redditly_comments', JSON.stringify(store.comments));
        });
        
        // Setup save button
        saveBtn?.addEventListener('click', () => {
            if (!store.currentUser) {
                const loginModal = document.getElementById('login-modal');
                loginModal.style.display = 'flex';
                return;
            }
            
            // Check if already saved
            const isSaved = store.savedComments.includes(commentId);
            
            if (isSaved) {
                // Unsave comment
                store.savedComments = store.savedComments.filter(id => id !== commentId);
                saveBtn.classList.remove('saved');
                saveBtn.querySelector('span').textContent = 'Save';
                showNotification('Comment unsaved');
            } else {
                // Save comment
                store.savedComments.push(commentId);
                saveBtn.classList.add('saved');
                saveBtn.querySelector('span').textContent = 'Unsave';
                showNotification('Comment saved');
            }
            
            // Save to localStorage
            localStorage.setItem(`redditly_saved_comments_${store.currentUser.username}`, JSON.stringify(store.savedComments));
        });
    });
}

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error)
 */
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Append to body
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * Create confetti effect at click position
 * Similar to enhanced-features.js but included here for modularity
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

// Global store for data
const store = {
    currentUser: null,
    posts: [],
    communities: [],
    comments: [],
    savedPosts: [],
    savedComments: []
}; 