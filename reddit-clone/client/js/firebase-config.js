/**
 * Firebase Configuration
 * Initializes Firebase and exports Firestore database
 */

// Firebase configuration - replace with your own Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyBnN29RHXU4mdnudxXVfO7NQpFMbdYxaWw",
  authDomain: "redditly-clone.firebaseapp.com",
  projectId: "redditly-clone",
  storageBucket: "redditly-clone.appspot.com",
  messagingSenderId: "12345678901",
  appId: "1:12345678901:web:abc123def456"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence()
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a time.
      console.log('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the
      // features required to enable persistence
      console.log('Persistence not supported by this browser');
    }
  });

// Collections references
const communitiesRef = db.collection('communities');
const postsRef = db.collection('posts');
const commentsRef = db.collection('comments');
const usersRef = db.collection('users');

// Export Firebase functionality
window.firebaseDB = {
  db,
  communitiesRef,
  postsRef,
  commentsRef,
  usersRef,
  firebase
}; 