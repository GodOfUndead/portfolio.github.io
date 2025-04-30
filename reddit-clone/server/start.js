// Simple script to start either the full server or the static server
// Usage: node start.js [--static]

const { spawn } = require('child_process');
const path = require('path');

// Check if --static flag is provided
const useStaticServer = process.argv.includes('--static');
const serverFile = useStaticServer ? 'serve.js' : 'server.js';

console.log(`Starting ${useStaticServer ? 'static' : 'full'} server...`);

// Spawn the server process
const server = spawn('node', [path.join(__dirname, serverFile)], {
  stdio: 'inherit'
});

// Handle server process events
server.on('close', code => {
  console.log(`Server process exited with code ${code}`);
});

// Handle SIGINT (Ctrl+C) to gracefully shut down
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.kill('SIGINT');
  process.exit(0);
}); 