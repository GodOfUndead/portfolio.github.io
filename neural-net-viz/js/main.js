/**
 * Main entry point for the Neural Network Visualizer
 * Initializes all components and sets up the application
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initApplication();
});

/**
 * Initialize the application
 */
function initApplication() {
    // Enhance the loader with dynamic content
    enhanceLoader();
    
    // Initialize custom cursor
    initCustomCursor();
    
    // Initialize the theme toggle
    initThemeToggle();
    
    // Initialize the neural network component
    initNeuralNetwork();
}

/**
 * Enhance the loader with dynamic content and animations
 */
function enhanceLoader() {
    const loader = document.querySelector('.loader');
    const loaderStatus = document.querySelector('.loader-status');
    const progressBar = document.querySelector('.progress-bar');
    
    if (!loader || !loaderStatus || !progressBar) return;
    
    // Array of loading messages to cycle through
    const loadingMessages = [
        'Loading TensorFlow.js',
        'Initializing neural network model',
        'Preparing visualizations',
        'Loading datasets',
        'Configuring UI components',
        'Optimizing performance',
        'Almost there...'
    ];
    
    // Update the status message every 500ms
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
        loaderStatus.textContent = loadingMessages[messageIndex];
        messageIndex = (messageIndex + 1) % loadingMessages.length;
    }, 500);
    
    // Hide the loader when the page is ready
    window.addEventListener('load', () => {
        // Ensure the progress bar reaches 100%
        progressBar.style.width = '100%';
        loaderStatus.textContent = 'Ready!';
        
        // Clear the message interval
        clearInterval(messageInterval);
        
        // Hide the loader after a delay for a smoother experience
        setTimeout(() => {
            if (loader) {
                loader.classList.add('hidden');
                
                // Remove the loader from DOM after transition
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }
        }, 1000);
    });
}

/**
 * Initialize custom cursor
 */
function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const dot = document.querySelector('.dot');
    
    if (!cursor || !dot) return;
    
    // Track cursor position with smoothing
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let dotX = 0, dotY = 0;
    
    // Mouse movement handler with smoothing
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Click animation
    document.addEventListener('mousedown', () => {
        cursor.classList.add('click');
        dot.style.transform = 'translate(-50%, -50%) scale(0.5)';
    });
    
    document.addEventListener('mouseup', () => {
        cursor.classList.remove('click');
        dot.style.transform = 'translate(-50%, -50%) scale(1)';
    });
    
    // Hover effect on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .slider, select, input, canvas, .dataset-btn');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            dot.classList.add('hover');
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            dot.classList.remove('hover');
        });
    });
    
    // Hide cursor when it leaves the window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = 0;
        dot.style.opacity = 0;
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = 1;
        dot.style.opacity = 1;
    });
    
    // Animate cursor movement
    function animateCursor() {
        // Smoothing factor
        const smoothing = 0.15;
        const dotSmoothing = 0.2;
        
        // Apply smoothing to cursor
        cursorX += (mouseX - cursorX) * smoothing;
        cursorY += (mouseY - cursorY) * smoothing;
        
        // Apply smoothing to dot with slight delay
        dotX += (mouseX - dotX) * dotSmoothing;
        dotY += (mouseY - dotY) * dotSmoothing;
        
        // Apply positions
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        
        dot.style.left = `${dotX}px`;
        dot.style.top = `${dotY}px`;
        
        requestAnimationFrame(animateCursor);
    }
    
    // Start animation
    animateCursor();
    
    // Hide cursor on mobile devices
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        cursor.style.display = 'none';
        dot.style.display = 'none';
    }
}

/**
 * Initialize theme toggle functionality
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (!themeToggle) return;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('neural-net-theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        
        // Save theme preference
        const isLightTheme = document.body.classList.contains('light-theme');
        localStorage.setItem('neural-net-theme', isLightTheme ? 'light' : 'dark');
        
        // Update visualization if available
        if (window.neuralViz && window.neuralViz.visualizer) {
            window.neuralViz.visualizer.updateVisualization();
        }
    });
}

/**
 * Initialize the neural network visualization
 */
function initNeuralNetwork() {
    // Get canvas elements
    const networkCanvas = document.getElementById('network-canvas');
    const decisionCanvas = document.getElementById('decision-boundary-canvas');
    
    // Make sure canvases are available
    if (!networkCanvas || !decisionCanvas) {
        console.error('Canvas elements not found.');
        return;
    }
    
    // TensorFlow.js memory management
    // Use WebGL backend if available for better performance
    tf.setBackend('webgl').catch(() => {
        console.warn('WebGL backend not available, falling back to CPU.');
        tf.setBackend('cpu');
    });
    
    try {
        // Initialize components
        const neuralNetwork = new NeuralNetwork({
            inputSize: 2,
            outputSize: 1,
            hiddenLayers: 3,
            neuronsPerLayer: 5,
            activation: 'sigmoid',
            learningRate: 0.03,
            batchSize: 8,
            optimizer: 'adam'
        });
        
        const visualizer = new NetworkVisualizer(networkCanvas, decisionCanvas);
        const datasetGenerator = new DatasetGenerator();
        
        // Initialize UI Controller
        const uiController = new UIController(neuralNetwork, visualizer, datasetGenerator);
        
        // Hide advanced controls by default
        const advancedControls = document.querySelector('.advanced-controls');
        if (advancedControls) {
            advancedControls.style.display = 'none';
        }
        
        // Store references for debugging
        window.neuralViz = {
            neuralNetwork,
            visualizer,
            datasetGenerator,
            uiController
        };
    } catch (error) {
        console.error('Failed to initialize neural network:', error);
        
        // Show error message to user
        const networkContainer = document.querySelector('.network-container');
        if (networkContainer) {
            networkContainer.innerHTML = `
                <div style="color: var(--hover-color); text-align: center; padding: 20px;">
                    <h3>Initialization Error</h3>
                    <p>Could not initialize neural network visualization.</p>
                    <p>Error: ${error.message}</p>
                    <p>Please try refreshing the page or using a different browser.</p>
                </div>
            `;
        }
    }
} 