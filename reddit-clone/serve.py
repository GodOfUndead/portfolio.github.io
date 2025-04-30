#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys
import webbrowser
from urllib.parse import urlparse

# Configuration
PORT = 8000
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "client")

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Set the current directory to the client directory
        os.chdir(DIRECTORY)
        
        # Parse the URL path
        parsed_path = urlparse(path)
        path = parsed_path.path
        
        # If path is just "/" or empty, serve index.html
        if path == "/" or not path:
            return os.path.join(DIRECTORY, "index.html")
        
        # For any path that doesn't match a file, serve index.html (SPA routing)
        file_path = os.path.join(DIRECTORY, path[1:])
        if not os.path.exists(file_path) and not "." in path:
            return os.path.join(DIRECTORY, "index.html")
        
        return super().translate_path(path)
    
    def log_message(self, format, *args):
        # Custom logging format
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), format % args))

def run_server():
    handler = MyHttpRequestHandler
    
    # Set the directory for the server
    handler.directory = DIRECTORY
    
    # Create the server
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        print(f"Serving files from {DIRECTORY}")
        print("Press Ctrl+C to stop the server")
        
        # Open the browser
        webbrowser.open(f"http://localhost:{PORT}")
        
        # Start the server
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    run_server() 