# Discord Clone

A front-end implementation of Discord's user interface with real-time messaging capabilities.

## Features

- User authentication (local storage based for demo purposes)
- Real-time messaging
- Friend requests system
- Online/offline status indicators
- Server creation and management
- Direct messaging
- Desktop and in-app notifications
- Mobile responsive design

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla)
- WebSockets (with fallback to local mock data)

## How to Run

There are several ways to run this application:

### Method 1: Using Python (Recommended)

If you have Python installed, you can use the built-in HTTP server:

1. Navigate to the project directory in your terminal
2. Run the serve script:
   ```
   python serve.py
   ```
3. This will automatically open your browser at http://localhost:8000

### Method 2: Using any HTTP server

You can use any HTTP server of your choice, such as:

- Node.js with `http-server`
- PHP's built-in server
- Any other static file server

### Method 3: Opening directly in browser

You can simply open the `index.html` file directly in your browser, but some features may not work properly due to browser security restrictions.

## Usage

1. Register a new account or log in with an existing account
2. Explore the app's features:
   - Add friends using their username
   - Create servers and invite others
   - Send messages in channels or direct messages
   - Change your status (Online, Away, Do Not Disturb, Invisible)
   - Customize your profile in the settings

## Local Development

This application is designed to work without a backend server for demonstration purposes. It uses:

- LocalStorage for data persistence
- Mock WebSocket data for real-time features
- Simulated friend requests and messaging

For a production implementation, you would want to connect to a real backend server with WebSocket support.

## License

This project is for educational purposes only. Discord is a trademark of Discord Inc. 