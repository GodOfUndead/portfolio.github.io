# Redditly - A Reddit Clone

A full-stack Reddit clone with communities, posts, comments, and upvote functionality. Built with vanilla JavaScript, CSS, and Node.js.

![Redditly Screenshot](./client/assets/post-image-placeholder.jpg)

## Features

- 🔥 Modern Reddit-like UI with responsive design
- 👥 User authentication (signup/login)
- 🏘️ Communities (create, join, view)
- 📝 Posts with upvote/downvote functionality
- 💬 Comments on posts
- 🔍 Content filtering
- 📱 Mobile-responsive design

## Tech Stack

### Frontend
- Vanilla JavaScript (ES6+)
- CSS3 with modern features (Flexbox, Grid, Variables)
- Responsive design
- Font Awesome for icons

### Backend
- Node.js
- Express.js
- RESTful API architecture
- JWT for authentication (mocked for demo)

## Project Structure

```
reddit-clone/
├── client/              # Frontend files
│   ├── assets/          # Images, icons, etc.
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript files
│   └── index.html       # Main HTML file
│
└── server/              # Backend files
    ├── server.js        # Express server and API routes
    └── package.json     # Node.js dependencies
```

## Running the Project

### Prerequisites
- Node.js and npm installed

### Setup and Run

1. Clone the repository
   ```
   git clone <repository-url>
   cd reddit-clone
   ```

2. Install backend dependencies
   ```
   cd server
   npm install
   ```

3. Start the server
   ```
   npm run dev
   ```

4. Open the application
   - Open `http://localhost:5000` in your browser
   - You can also open the client directly by opening `client/index.html` in your browser

## Usage

### Demo Accounts
You can use these demo accounts to test the application:
- Username: `user1`, Password: `password123`
- Username: `user2`, Password: `password123`

### Features
- **Authentication**: Sign up or log in using the buttons in the top-right corner
- **Browsing**: View posts from different communities
- **Voting**: Upvote or downvote posts
- **Commenting**: Add comments to posts
- **Creating**: Create new posts and communities
- **Joining**: Subscribe to communities

## Implementation Details

### Frontend
The frontend is built with vanilla JavaScript without any frameworks, focusing on modern ES6+ features. The UI is designed to mimic Reddit's interface with a clean, responsive design using CSS Grid and Flexbox.

### Backend
The backend uses Express.js to create a RESTful API. For demonstration purposes, data is stored in memory rather than a database. In a production environment, this would be replaced with MongoDB or another database.

Authentication is simulated with simple checks rather than actual JWT implementation for demo purposes.

## Future Enhancements

- Real database integration (MongoDB)
- Proper JWT authentication
- Image uploading for posts
- Nested comments
- Rich text editor for posts and comments
- User profiles and settings
- Moderation tools
- Search functionality
- Real-time updates with WebSockets

## License

This project is for demonstration purposes only and is part of a portfolio. 