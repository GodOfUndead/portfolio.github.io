// Matrix background effect for the visualization
class MatrixBackground {
    constructor() {
        this.canvas = document.getElementById('matrix-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.fontSize = 14;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = [];
        
        // Initialize drops at random positions
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = Math.random() * -100;
        }
        
        // Cyberpunk color palette
        this.colors = [
            'rgba(100, 255, 218, 0.7)', // Accent color
            'rgba(255, 82, 119, 0.7)',  // Hover color
            'rgba(136, 146, 176, 0.7)',  // Secondary color
        ];
        
        this.characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,./<>?';
        
        this.animationId = null;
        this.isRunning = false;
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }
    
    stop() {
        if (this.isRunning) {
            cancelAnimationFrame(this.animationId);
            this.isRunning = false;
        }
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        
        // Reinitialize drops when resizing
        this.drops = [];
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = Math.random() * -100;
        }
    }
    
    animate() {
        this.ctx.fillStyle = 'rgba(13, 13, 13, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.font = `${this.fontSize}px monospace`;
        
        for (let i = 0; i < this.drops.length; i++) {
            // Choose a random character
            const text = this.characters.charAt(Math.floor(Math.random() * this.characters.length));
            
            // Choose a random color from the palette
            this.ctx.fillStyle = this.colors[Math.floor(Math.random() * this.colors.length)];
            
            // Draw the character
            this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);
            
            // Reset drop to top if it reaches bottom or randomly
            if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            
            // Move drop
            this.drops[i]++;
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// Initialize matrix background on window load
window.addEventListener('load', () => {
    const matrixBg = new MatrixBackground();
    
    // Start animation
    matrixBg.start();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        matrixBg.resize();
    });
    
    // Reduce CPU usage by pausing animation when tab is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            matrixBg.stop();
        } else {
            matrixBg.start();
        }
    });
}); 