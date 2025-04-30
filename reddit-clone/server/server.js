const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from client
app.use(express.static(path.join(__dirname, '../client')));

// Mock Database (in a real app, this would be MongoDB)
const users = [
  {
    id: '1',
    username: 'user1',
    email: 'user1@example.com',
    password: 'password123', // In a real app, this would be hashed
    createdAt: new Date(),
  },
  {
    id: '2',
    username: 'user2',
    email: 'user2@example.com',
    password: 'password123', 
    createdAt: new Date(),
  }
];

const communities = [
  {
    id: '1',
    name: 'programming',
    description: 'A community for programming enthusiasts',
    subscribers: ['1', '2'],
    createdAt: new Date(),
    createdBy: '1'
  },
  {
    id: '2',
    name: 'webdev',
    description: 'Web development discussions',
    subscribers: ['1'],
    createdAt: new Date(),
    createdBy: '1'
  },
  {
    id: '3',
    name: 'reactjs',
    description: 'All things React',
    subscribers: ['2'],
    createdAt: new Date(),
    createdBy: '2'
  }
];

const posts = [
  {
    id: '1',
    title: 'Announcing the Next Major Version of Our JavaScript Framework: What\'s New?',
    content: 'We\'re excited to share the upcoming features in our new release. The framework now includes improved performance, better type checking, and new hooks for state management.',
    communityId: '1',
    authorId: '1',
    upvotes: ['1'],
    downvotes: [],
    createdAt: new Date(),
    comments: ['1', '2']
  },
  {
    id: '2',
    title: 'I built a Reddit clone with full functionality - here\'s what I learned',
    communityId: '2',
    authorId: '2',
    upvotes: ['1', '2'],
    downvotes: [],
    createdAt: new Date(),
    comments: ['3']
  },
  {
    id: '3',
    title: 'Best practices for managing state in large React applications',
    content: 'After working on several large-scale React projects, I\'ve compiled a list of best practices for state management that can help avoid common pitfalls. What has worked well for your teams?',
    communityId: '3',
    authorId: '2',
    upvotes: ['1', '2'],
    downvotes: [],
    createdAt: new Date(),
    comments: []
  }
];

const comments = [
  {
    id: '1',
    content: 'This is amazing! Can\'t wait to try out the new hooks.',
    authorId: '2',
    postId: '1',
    upvotes: ['1'],
    downvotes: [],
    createdAt: new Date(),
  },
  {
    id: '2',
    content: 'When is the expected release date?',
    authorId: '1',
    postId: '1',
    upvotes: [],
    downvotes: [],
    createdAt: new Date(),
  },
  {
    id: '3',
    content: 'Great work! The UI looks very polished.',
    authorId: '1',
    postId: '2',
    upvotes: ['2'],
    downvotes: [],
    createdAt: new Date(),
  }
];

// Helper function to get user without password
const sanitizeUser = user => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// API Routes
// Auth Routes
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  
  // Check if user exists
  const userExists = users.find(user => user.username === username || user.email === email);
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  // Create new user
  const newUser = {
    id: (users.length + 1).toString(),
    username,
    email,
    password, // In a real app, this would be hashed
    createdAt: new Date()
  };
  
  // Add to users array
  users.push(newUser);
  
  // Return user without password
  res.status(201).json(sanitizeUser(newUser));
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Find user
  const user = users.find(user => user.username === username);
  
  // Check if user exists and password matches
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // In a real app, we would generate JWT token here
  res.json({
    user: sanitizeUser(user),
    token: 'mock-jwt-token'
  });
});

// Community Routes
app.get('/api/communities', (req, res) => {
  res.json(communities);
});

app.get('/api/communities/:id', (req, res) => {
  const community = communities.find(c => c.id === req.params.id);
  
  if (!community) {
    return res.status(404).json({ message: 'Community not found' });
  }
  
  res.json(community);
});

app.post('/api/communities', (req, res) => {
  const { name, description } = req.body;
  // In a real app, we would get the user ID from the JWT token
  const userId = req.body.userId || '1';
  
  // Check if community exists
  const communityExists = communities.find(c => c.name === name);
  if (communityExists) {
    return res.status(400).json({ message: 'Community already exists' });
  }
  
  // Create new community
  const newCommunity = {
    id: (communities.length + 1).toString(),
    name,
    description,
    subscribers: [userId],
    createdAt: new Date(),
    createdBy: userId
  };
  
  // Add to communities array
  communities.push(newCommunity);
  
  res.status(201).json(newCommunity);
});

// Post Routes
app.get('/api/posts', (req, res) => {
  // Get query parameters
  const { communityId } = req.query;
  
  // Filter posts by community if specified
  let filteredPosts = posts;
  if (communityId) {
    filteredPosts = posts.filter(post => post.communityId === communityId);
  }
  
  // Enhance posts with author and community info
  const enhancedPosts = filteredPosts.map(post => {
    const author = users.find(user => user.id === post.authorId);
    const community = communities.find(c => c.id === post.communityId);
    
    return {
      ...post,
      author: sanitizeUser(author),
      community,
      commentCount: post.comments.length,
      voteCount: post.upvotes.length - post.downvotes.length
    };
  });
  
  res.json(enhancedPosts);
});

app.get('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  
  const author = users.find(user => user.id === post.authorId);
  const community = communities.find(c => c.id === post.communityId);
  
  // Get comments for the post
  const postComments = comments
    .filter(comment => comment.postId === post.id)
    .map(comment => {
      const commentAuthor = users.find(user => user.id === comment.authorId);
      return {
        ...comment,
        author: sanitizeUser(commentAuthor),
        voteCount: comment.upvotes.length - comment.downvotes.length
      };
    });
  
  res.json({
    ...post,
    author: sanitizeUser(author),
    community,
    comments: postComments,
    voteCount: post.upvotes.length - post.downvotes.length
  });
});

app.post('/api/posts', (req, res) => {
  const { title, content, communityId } = req.body;
  // In a real app, we would get the user ID from the JWT token
  const userId = req.body.userId || '1';
  
  // Check if community exists
  const community = communities.find(c => c.id === communityId);
  if (!community) {
    return res.status(404).json({ message: 'Community not found' });
  }
  
  // Create new post
  const newPost = {
    id: (posts.length + 1).toString(),
    title,
    content,
    communityId,
    authorId: userId,
    upvotes: [],
    downvotes: [],
    createdAt: new Date(),
    comments: []
  };
  
  // Add to posts array
  posts.push(newPost);
  
  // Enhance post with author and community info
  const author = users.find(user => user.id === userId);
  
  res.status(201).json({
    ...newPost,
    author: sanitizeUser(author),
    community,
    commentCount: 0,
    voteCount: 0
  });
});

// Vote Routes
app.post('/api/posts/:id/vote', (req, res) => {
  const { voteType } = req.body;
  // In a real app, we would get the user ID from the JWT token
  const userId = req.body.userId || '1';
  
  const post = posts.find(p => p.id === req.params.id);
  
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  
  // Remove existing votes by this user
  post.upvotes = post.upvotes.filter(id => id !== userId);
  post.downvotes = post.downvotes.filter(id => id !== userId);
  
  // Add new vote if not 'none'
  if (voteType === 'upvote') {
    post.upvotes.push(userId);
  } else if (voteType === 'downvote') {
    post.downvotes.push(userId);
  }
  
  res.json({
    voteCount: post.upvotes.length - post.downvotes.length,
    upvoted: post.upvotes.includes(userId),
    downvoted: post.downvotes.includes(userId)
  });
});

// Comment Routes
app.get('/api/posts/:postId/comments', (req, res) => {
  const { postId } = req.params;
  
  const post = posts.find(p => p.id === postId);
  
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  
  // Get comments for the post
  const postComments = comments
    .filter(comment => comment.postId === postId)
    .map(comment => {
      const author = users.find(user => user.id === comment.authorId);
      return {
        ...comment,
        author: sanitizeUser(author),
        voteCount: comment.upvotes.length - comment.downvotes.length
      };
    });
  
  res.json(postComments);
});

app.post('/api/posts/:postId/comments', (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  // In a real app, we would get the user ID from the JWT token
  const userId = req.body.userId || '1';
  
  const post = posts.find(p => p.id === postId);
  
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  
  // Create new comment
  const newComment = {
    id: (comments.length + 1).toString(),
    content,
    authorId: userId,
    postId,
    upvotes: [],
    downvotes: [],
    createdAt: new Date()
  };
  
  // Add to comments array
  comments.push(newComment);
  
  // Add comment ID to post
  post.comments.push(newComment.id);
  
  // Enhance comment with author info
  const author = users.find(user => user.id === userId);
  
  res.status(201).json({
    ...newComment,
    author: sanitizeUser(author),
    voteCount: 0
  });
});

// Community subscription
app.post('/api/communities/:id/subscribe', (req, res) => {
  const { id } = req.params;
  // In a real app, we would get the user ID from the JWT token
  const userId = req.body.userId || '1';
  
  const community = communities.find(c => c.id === id);
  
  if (!community) {
    return res.status(404).json({ message: 'Community not found' });
  }
  
  // Check if already subscribed
  const alreadySubscribed = community.subscribers.includes(userId);
  
  if (alreadySubscribed) {
    // Unsubscribe
    community.subscribers = community.subscribers.filter(id => id !== userId);
    res.json({ subscribed: false, subscriberCount: community.subscribers.length });
  } else {
    // Subscribe
    community.subscribers.push(userId);
    res.json({ subscribed: true, subscriberCount: community.subscribers.length });
  }
});

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 