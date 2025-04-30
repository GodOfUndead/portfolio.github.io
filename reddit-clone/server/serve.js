const express = require('express');
const path = require('path');

const app = express();

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// Serve the index.html for any route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Start server on port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 