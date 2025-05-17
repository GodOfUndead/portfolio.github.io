/**
 * Neural Network Visualizer class
 * Handles rendering the network architecture and decision boundaries
 */
class NetworkVisualizer {
    constructor(networkCanvas, decisionCanvas) {
        // Canvas for drawing the network
        this.networkCanvas = networkCanvas;
        this.networkCtx = networkCanvas.getContext('2d');
        
        // Canvas for drawing the decision boundary
        this.decisionCanvas = decisionCanvas;
        this.decisionCtx = decisionCanvas.getContext('2d');
        
        // Set canvas dimensions
        this.resizeCanvases();
        
        // Visualization parameters
        this.params = {
            // Network canvas
            neuronRadius: 15,
            neuronSpacing: 40,
            layerSpacing: 120,
            neuronStrokeWidth: 2,
            connectionWidth: 2,
            
            // Decision boundary
            dataPointRadius: 6,
            gridResolution: 50,
            
            // Animation
            animationDuration: 300,
            weightTransitionSpeed: 0.1,
            
            // Colors
            positiveColor: 'rgba(100, 255, 218, 0.7)',
            negativeColor: 'rgba(255, 82, 119, 0.7)',
            neuronColor: '#1a1a1a',
            neuronStroke: '#64ffda',
            activeNeuronStroke: '#ff5277',
            classAColor: '#64ffda',
            classBColor: '#ff5277',
            gridColor: 'rgba(35, 53, 84, 0.2)'
        };
        
        // State for animations
        this.animations = {
            weights: [],
            neurons: []
        };
        
        // Training data points for display
        this.dataPoints = [];
        
        // Animation frame
        this.animationFrameId = null;
        
        // Flag to track if animation is running
        this.isAnimating = false;
        
        // Initialize
        this.initEventListeners();
    }
    
    /**
     * Initialize event listeners (like window resize)
     */
    initEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvases());
    }
    
    /**
     * Resize canvases to fill their containers
     */
    resizeCanvases() {
        const resizeCanvas = (canvas) => {
            const container = canvas.parentElement;
            // Use offsetWidth/offsetHeight for actual size
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;

            // Set canvas pixel size for high-DPI screens
            const dpr = window.devicePixelRatio || 1;
            canvas.width = containerWidth * dpr;
            canvas.height = containerHeight * dpr;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.getContext('2d').setTransform(1, 0, 0, 1, 0, 0); // Reset transform
            canvas.getContext('2d').scale(dpr, dpr);
        };

        resizeCanvas(this.networkCanvas);
        resizeCanvas(this.decisionCanvas);
    }
    
    /**
     * Set training data for visualization
     * @param {Array} xData - Input data points
     * @param {Array} yData - Target labels
     */
    setData(xData, yData) {
        this.dataPoints = xData.map((point, i) => ({
            x: point[0],
            y: point[1],
            class: yData[i][0]
        }));
    }
    
    /**
     * Draw the neural network based on current state
     * @param {Object} networkState - Current state of the network
     */
    drawNetwork(networkState) {
        const { config, weights } = networkState;
        const ctx = this.networkCtx;
        const width = this.networkCanvas.width / (window.devicePixelRatio || 1);
        const height = this.networkCanvas.height / (window.devicePixelRatio || 1);
        const size = Math.min(width, height);
        ctx.clearRect(0, 0, width, height);

        // Calculate layout using the minimum size and center the network
        const layers = this.calculateNetworkLayout(config, size, width, height);
        this.drawConnections(layers, weights);
        this.drawNeurons(layers, networkState);
    }
    
    /**
     * Calculate positions for all neurons in the network
     * @param {Object} config - Network configuration
     * @param {number} size - The minimum of width and height
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @returns {Array} - Array of layers with neuron positions
     */
    calculateNetworkLayout(config, size, width, height) {
        const { inputSize, outputSize, hiddenLayers, neuronsPerLayer } = config;
        // Use size for layout, center in the canvas
        const totalLayers = hiddenLayers + 2;
        const layerSpacing = Math.min(this.params.layerSpacing, (size - 100) / (totalLayers - 1));
        const layerCenters = [];
        const startX = (width - (layerSpacing * (totalLayers - 1))) / 2;
        for (let i = 0; i < totalLayers; i++) {
            layerCenters.push(startX + i * layerSpacing);
        }
        const layers = [];
        // Input layer
        const inputLayer = { neurons: [] };
        const inputNeuronSpacing = Math.min(this.params.neuronSpacing, (size - 80) / (inputSize + 1));
        const inputStartY = (height - (inputNeuronSpacing * (inputSize - 1))) / 2;
        for (let i = 0; i < inputSize; i++) {
            inputLayer.neurons.push({
                x: layerCenters[0],
                y: inputStartY + i * inputNeuronSpacing,
                activation: 0.5
            });
        }
        layers.push(inputLayer);
        // Hidden layers
        for (let i = 0; i < hiddenLayers; i++) {
            const hiddenLayer = { neurons: [] };
            const neuronSpacing = Math.min(this.params.neuronSpacing, (size - 80) / (neuronsPerLayer + 1));
            const startY = (height - (neuronSpacing * (neuronsPerLayer - 1))) / 2;
            for (let j = 0; j < neuronsPerLayer; j++) {
                hiddenLayer.neurons.push({
                    x: layerCenters[i + 1],
                    y: startY + j * neuronSpacing,
                    activation: 0.5
                });
            }
            layers.push(hiddenLayer);
        }
        // Output layer
        const outputLayer = { neurons: [] };
        const outputNeuronSpacing = Math.min(this.params.neuronSpacing, (size - 80) / (outputSize + 1));
        const outputStartY = (height - (outputNeuronSpacing * (outputSize - 1))) / 2;
        for (let i = 0; i < outputSize; i++) {
            outputLayer.neurons.push({
                x: layerCenters[totalLayers - 1],
                y: outputStartY + i * outputNeuronSpacing,
                activation: 0.5
            });
        }
        layers.push(outputLayer);
        return layers;
    }
    
    /**
     * Draw connections between neurons with weights represented by color and thickness
     * @param {Array} layers - Network layout
     * @param {Array} weights - Weight matrices
     */
    drawConnections(layers, weights) {
        const ctx = this.networkCtx;
        
        // For each layer (except the last)
        for (let l = 0; l < layers.length - 1; l++) {
            const currentLayer = layers[l];
            const nextLayer = layers[l + 1];
            
            // Get weight matrix for this layer (if available)
            const weightMatrix = weights[l] || Array(currentLayer.neurons.length).fill().map(() => 
                Array(nextLayer.neurons.length).fill(0)
            );
            
            // Calculate weight ranges for normalization
            let maxWeight = 0;
            for (let i = 0; i < weightMatrix.length; i++) {
                for (let j = 0; j < weightMatrix[i].length; j++) {
                    maxWeight = Math.max(maxWeight, Math.abs(weightMatrix[i][j]));
                }
            }
            maxWeight = Math.max(maxWeight, 0.1); // Prevent division by zero
            
            // Draw connections
            for (let i = 0; i < currentLayer.neurons.length; i++) {
                const neuron = currentLayer.neurons[i];
                
                for (let j = 0; j < nextLayer.neurons.length; j++) {
                    const nextNeuron = nextLayer.neurons[j];
                    const weight = weightMatrix[i] ? weightMatrix[i][j] : 0;
                    
                    // Normalize weight for visualization
                    const normalizedWeight = weight / maxWeight;
                    
                    // Calculate connection properties
                    const connectionWidth = Math.abs(normalizedWeight) * 3 + 0.5;
                    const connectionColor = weight >= 0 ? this.params.positiveColor : this.params.negativeColor;
                    const connectionOpacity = Math.abs(normalizedWeight) * 0.8 + 0.2;
                    
                    // Draw connection
                    ctx.beginPath();
                    ctx.moveTo(neuron.x, neuron.y);
                    ctx.lineTo(nextNeuron.x, nextNeuron.y);
                    ctx.strokeStyle = connectionColor;
                    ctx.globalAlpha = connectionOpacity;
                    ctx.lineWidth = connectionWidth;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }
        }
    }
    
    /**
     * Draw neurons with activations represented by fill color
     * @param {Array} layers - Network layout
     * @param {Object} networkState - Current state of the network
     */
    drawNeurons(layers, networkState) {
        const ctx = this.networkCtx;
        const { layerOutputs } = networkState;
        
        // For each layer
        layers.forEach((layer, layerIndex) => {
            const layerOutput = layerOutputs[layerIndex];
            
            // Draw each neuron
            layer.neurons.forEach((neuron, neuronIndex) => {
                const activation = layerOutput ? layerOutput[0][neuronIndex] : 0.5;
                
                // Draw neuron
                ctx.beginPath();
                ctx.arc(neuron.x, neuron.y, this.params.neuronRadius, 0, Math.PI * 2);
                
                // Fill based on activation
                const fillColor = this.getActivationColor(activation);
                ctx.fillStyle = fillColor;
                ctx.fill();
                
                // Stroke
                ctx.lineWidth = this.params.neuronStrokeWidth;
                ctx.strokeStyle = this.params.neuronStroke;
                ctx.stroke();
                
                // Draw activation text
                if (activation !== undefined) {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '10px var(--font-mono)';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(activation.toFixed(1), neuron.x, neuron.y);
                }
            });
        });
    }
    
    /**
     * Get color representing an activation value
     * @param {Number} value - Activation value [0, 1]
     * @returns {String} - CSS color string
     */
    getActivationColor(value) {
        if (value === undefined) return this.params.neuronColor;
        
        // Scale to [0, 1]
        const normalized = Math.max(0, Math.min(1, value));
        
        // Interpolate between negative and positive colors
        const r = Math.round(26 + normalized * (255 - 26));
        const g = Math.round(26 + normalized * (82 - 26));
        const b = Math.round(26 + normalized * (119 - 26));
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    /**
     * Draw decision boundary visualization
     * @param {Object} boundaryData - Decision boundary data
     * @param {Array} dataPoints - Training data points
     */
    drawDecisionBoundary(boundaryData, dataPoints = null) {
        const { gridX, gridY, predictions } = boundaryData;
        const ctx = this.decisionCtx;
        const width = this.decisionCanvas.width / (window.devicePixelRatio || 1);
        const height = this.decisionCanvas.height / (window.devicePixelRatio || 1);
        const size = Math.min(width, height);
        ctx.clearRect(0, 0, width, height);
        // Draw grid and predictions using size for square area, centered
        const offsetX = (width - size) / 2;
        const offsetY = (height - size) / 2;
        const cellWidth = size / gridX.length;
        const cellHeight = size / gridY.length;
        for (let i = 0; i < gridX.length; i++) {
            for (let j = 0; j < gridY.length; j++) {
                const predictionIndex = i * gridY.length + j;
                const prediction = predictions[predictionIndex];
                let color;
                if (prediction < 0.5) {
                    const intensity = 1 - prediction * 2;
                    color = `rgba(100, 255, 218, ${intensity * 0.5})`;
                } else {
                    const intensity = (prediction - 0.5) * 2;
                    color = `rgba(255, 82, 119, ${intensity * 0.5})`;
                }
                const x = offsetX + i * cellWidth;
                const y = offsetY + j * cellHeight;
                ctx.fillStyle = color;
                ctx.fillRect(x, y, cellWidth, cellHeight);
            }
        }
        // Draw grid lines
        ctx.strokeStyle = this.params.gridColor;
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= gridX.length; i++) {
            const x = offsetX + i * cellWidth;
            ctx.beginPath();
            ctx.moveTo(x, offsetY);
            ctx.lineTo(x, offsetY + size);
            ctx.stroke();
        }
        for (let j = 0; j <= gridY.length; j++) {
            const y = offsetY + j * cellHeight;
            ctx.beginPath();
            ctx.moveTo(offsetX, y);
            ctx.lineTo(offsetX + size, y);
            ctx.stroke();
        }
        // Draw axis
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        const midY = offsetY + size / 2;
        ctx.beginPath();
        ctx.moveTo(offsetX, midY);
        ctx.lineTo(offsetX + size, midY);
        ctx.stroke();
        const midX = offsetX + size / 2;
        ctx.beginPath();
        ctx.moveTo(midX, offsetY);
        ctx.lineTo(midX, offsetY + size);
        ctx.stroke();
        // Draw data points if provided
        if (dataPoints) {
            this.drawDataPoints(dataPoints, size, offsetX, offsetY);
        } else if (this.dataPoints.length > 0) {
            this.drawDataPoints(this.dataPoints, size, offsetX, offsetY);
        }
    }
    
    /**
     * Draw data points on the decision boundary canvas
     * @param {Array} dataPoints - Training data points
     * @param {number} size - The square area size
     * @param {number} offsetX - X offset for centering
     * @param {number} offsetY - Y offset for centering
     */
    drawDataPoints(dataPoints, size, offsetX, offsetY) {
        const ctx = this.decisionCtx;
        // Calculate scale to map data points to square area
        const xValues = dataPoints.map(p => p.x);
        const yValues = dataPoints.map(p => p.y);
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const yMin = Math.min(...yValues);
        const yMax = Math.max(...yValues);
        const xRange = xMax - xMin || 2;
        const yRange = yMax - yMin || 2;
        const scaleFactor = 0.8;
        // Map data point coordinates to square canvas coordinates
        dataPoints.forEach(point => {
            const canvasX = offsetX + ((point.x - xMin) / xRange) * size * scaleFactor + size * (1 - scaleFactor) / 2;
            const canvasY = offsetY + size - (((point.y - yMin) / yRange) * size * scaleFactor + size * (1 - scaleFactor) / 2);
            ctx.beginPath();
            ctx.arc(canvasX, canvasY, this.params.dataPointRadius, 0, Math.PI * 2);
            ctx.fillStyle = point.class === 0 ? this.params.classAColor : this.params.classBColor;
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#fff';
            ctx.stroke();
        });
    }
    
    /**
     * Start animation loop
     */
    startAnimation() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.animate();
    }
    
    /**
     * Stop animation loop
     */
    stopAnimation() {
        this.isAnimating = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    /**
     * Animation loop
     */
    animate() {
        // Perform animation updates here
        
        if (this.isAnimating) {
            this.animationFrameId = requestAnimationFrame(() => this.animate());
        }
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        this.stopAnimation();
        window.removeEventListener('resize', this.resizeCanvases);
    }
} 