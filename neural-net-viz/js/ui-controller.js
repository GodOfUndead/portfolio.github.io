/**
 * UI Controller class
 * Handles user interactions with the visualization
 */
class UIController {
    constructor(neuralNetwork, visualizer, datasetGenerator) {
        // Store instances
        this.neuralNetwork = neuralNetwork;
        this.visualizer = visualizer;
        this.datasetGenerator = datasetGenerator;
        
        // UI elements
        this.elements = {
            // Network architecture controls
            layersSlider: document.getElementById('layers-slider'),
            layersValue: document.getElementById('layers-value'),
            neuronsSlider: document.getElementById('neurons-slider'),
            neuronsValue: document.getElementById('neurons-value'),
            
            // Training parameters controls
            learningRateSlider: document.getElementById('learning-rate-slider'),
            learningRateValue: document.getElementById('learning-rate-value'),
            activationSelect: document.getElementById('activation-select'),
            
            // Dataset controls
            datasetBtns: document.querySelectorAll('.dataset-btn'),
            customDatasetContainer: document.getElementById('custom-dataset-container'),
            customDatasetCanvas: document.getElementById('custom-dataset-canvas'),
            clearDatasetBtn: document.getElementById('clear-dataset-btn'),
            pointClassSelect: document.getElementById('point-class-select'),
            
            // Action buttons
            trainBtn: document.getElementById('train-btn'),
            resetBtn: document.getElementById('reset-btn'),
            saveModelBtn: document.getElementById('save-model-btn'),
            loadModelBtn: document.getElementById('load-model-btn'),
            modelFileInput: document.getElementById('model-file-input'),
            
            // Advanced controls
            optimizerSelect: document.getElementById('optimizer-select'),
            batchSizeSlider: document.getElementById('batch-size-slider'),
            batchSizeValue: document.getElementById('batch-size-value'),
            regularizationSlider: document.getElementById('regularization-slider'),
            regularizationValue: document.getElementById('regularization-value'),
            toggleAdvancedBtn: document.getElementById('toggle-advanced-btn'),
            
            // Stats display
            epochValue: document.getElementById('epoch-value'),
            lossValue: document.getElementById('loss-value'),
            accuracyValue: document.getElementById('accuracy-value')
        };
        
        // Internal state
        this.state = {
            currentDataset: 'xor',
            isTraining: false,
            isCustomDrawing: false,
            customDataCtx: this.elements.customDatasetCanvas.getContext('2d'),
            trainedEpochs: 0,
            advancedVisible: false
        };
        
        // Initialize
        this.initEventListeners();
        this.initCustomCanvas();
        this.updateUIValues();
        this.loadDataset('xor');
        
        // Initial visualization
        this.updateVisualization();
    }
    
    /**
     * Initialize all event listeners
     */
    initEventListeners() {
        // Network architecture sliders
        this.elements.layersSlider.addEventListener('input', () => {
            this.elements.layersValue.textContent = this.elements.layersSlider.value;
        });
        
        this.elements.layersSlider.addEventListener('change', () => {
            this.updateNetworkConfig();
        });
        
        this.elements.neuronsSlider.addEventListener('input', () => {
            this.elements.neuronsValue.textContent = this.elements.neuronsSlider.value;
        });
        
        this.elements.neuronsSlider.addEventListener('change', () => {
            this.updateNetworkConfig();
        });
        
        // Training parameters
        this.elements.learningRateSlider.addEventListener('input', () => {
            const value = parseFloat(this.elements.learningRateSlider.value) / 1000;
            this.elements.learningRateValue.textContent = value.toFixed(3);
        });
        
        this.elements.learningRateSlider.addEventListener('change', () => {
            this.updateNetworkConfig();
        });
        
        this.elements.activationSelect.addEventListener('change', () => {
            this.updateNetworkConfig();
        });
        
        // Dataset selection
        this.elements.datasetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button
                this.elements.datasetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Load dataset
                const datasetName = btn.getAttribute('data-dataset');
                this.state.currentDataset = datasetName;
                
                // Show/hide custom dataset container
                if (datasetName === 'custom') {
                    this.elements.customDatasetContainer.classList.remove('hidden');
                } else {
                    this.elements.customDatasetContainer.classList.add('hidden');
                    this.loadDataset(datasetName);
                }
            });
        });
        
        // Clear custom dataset button
        this.elements.clearDatasetBtn.addEventListener('click', () => {
            this.datasetGenerator.clearCustomDataset();
            this.clearCustomCanvas();
        });
        
        // Train button
        this.elements.trainBtn.addEventListener('click', () => {
            if (this.state.isTraining) {
                this.stopTraining();
            } else {
                this.startTraining();
            }
        });
        
        // Reset button
        this.elements.resetBtn.addEventListener('click', () => {
            this.resetNetwork();
        });
        
        // Save model button
        this.elements.saveModelBtn.addEventListener('click', () => {
            this.saveModel();
        });
        
        // Load model button
        this.elements.loadModelBtn.addEventListener('click', () => {
            this.elements.modelFileInput.click();
        });
        
        // File input change handler
        this.elements.modelFileInput.addEventListener('change', (event) => {
            if (event.target.files.length > 0) {
                this.loadModelFromFile(event.target.files[0]);
            }
        });
        
        // Advanced controls
        this.elements.optimizerSelect.addEventListener('change', () => {
            this.updateNetworkConfig();
        });
        
        this.elements.batchSizeSlider.addEventListener('input', () => {
            this.elements.batchSizeValue.textContent = this.elements.batchSizeSlider.value;
        });
        
        this.elements.batchSizeSlider.addEventListener('change', () => {
            this.updateNetworkConfig();
        });
        
        this.elements.regularizationSlider.addEventListener('input', () => {
            const value = parseFloat(this.elements.regularizationSlider.value) / 10000;
            this.elements.regularizationValue.textContent = value.toFixed(4);
        });
        
        this.elements.regularizationSlider.addEventListener('change', () => {
            this.updateNetworkConfig();
        });
        
        // Toggle advanced settings
        this.elements.toggleAdvancedBtn.addEventListener('click', () => {
            const advancedControls = document.querySelector('.advanced-controls');
            if (advancedControls) {
                this.state.advancedVisible = !this.state.advancedVisible;
                if (this.state.advancedVisible) {
                    advancedControls.style.display = 'grid';
                    this.elements.toggleAdvancedBtn.innerHTML = '<i class="fas fa-cog"></i> Hide Advanced Features';
                } else {
                    advancedControls.style.display = 'none';
                    this.elements.toggleAdvancedBtn.innerHTML = '<i class="fas fa-cog"></i> Show Advanced Features';
                }
            }
        });
        
        // Window resize handler
        window.addEventListener('resize', () => {
            this.visualizer.resizeCanvases();
            this.updateVisualization();
        });
    }
    
    /**
     * Initialize custom dataset canvas
     */
    initCustomCanvas() {
        // Set canvas dimensions
        const canvas = this.elements.customDatasetCanvas;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        
        // Add event listeners for drawing
        canvas.addEventListener('mousedown', (e) => {
            this.state.isCustomDrawing = true;
            this.addCustomDataPoint(e);
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (this.state.isCustomDrawing) {
                this.addCustomDataPoint(e);
            }
        });
        
        canvas.addEventListener('mouseup', () => {
            this.state.isCustomDrawing = false;
        });
        
        canvas.addEventListener('mouseleave', () => {
            this.state.isCustomDrawing = false;
        });
        
        // Initialize with empty canvas
        this.clearCustomCanvas();
    }
    
    /**
     * Add a custom data point based on mouse event
     * @param {MouseEvent} e - Mouse event
     */
    addCustomDataPoint(e) {
        const canvas = this.elements.customDatasetCanvas;
        const rect = canvas.getBoundingClientRect();
        
        // Calculate normalized position [0, 1]
        const x = (e.clientX - rect.left) / canvas.width;
        const y = (e.clientY - rect.top) / canvas.height;
        
        // Get class from selector
        const classLabel = parseInt(this.elements.pointClassSelect.value);
        
        // Add point to dataset
        this.datasetGenerator.addCustomPoint(x, y, classLabel);
        
        // Draw point on canvas
        this.drawCustomDataPoint(x, y, classLabel);
        
        // Update visualization if needed
        if (this.state.currentDataset === 'custom') {
            this.loadDataset('custom');
        }
    }
    
    /**
     * Draw a data point on the custom dataset canvas
     * @param {Number} x - X coordinate [0, 1]
     * @param {Number} y - Y coordinate [0, 1]
     * @param {Number} classLabel - Class label (0 or 1)
     */
    drawCustomDataPoint(x, y, classLabel) {
        const canvas = this.elements.customDatasetCanvas;
        const ctx = this.state.customDataCtx;
        
        // Calculate pixel position
        const pixelX = x * canvas.width;
        const pixelY = y * canvas.height;
        
        // Set color based on class
        ctx.fillStyle = classLabel === 0 ? 
            'rgba(100, 255, 218, 0.8)' : 'rgba(255, 82, 119, 0.8)';
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    /**
     * Clear the custom dataset canvas
     */
    clearCustomCanvas() {
        const canvas = this.elements.customDatasetCanvas;
        const ctx = this.state.customDataCtx;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(35, 53, 84, 0.3)';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let i = 0; i <= 10; i++) {
            const x = i * canvas.width / 10;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let i = 0; i <= 10; i++) {
            const y = i * canvas.height / 10;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Draw axes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
    }
    
    /**
     * Load a dataset by name
     * @param {String} datasetName - Name of the dataset
     */
    loadDataset(datasetName) {
        // Get dataset
        const dataset = this.datasetGenerator.getDataset(datasetName);
        
        // Set data for visualization
        this.visualizer.setData(dataset.x, dataset.y);
        
        // Update visualization
        this.updateVisualization();
    }
    
    /**
     * Update network configuration from UI values
     */
    updateNetworkConfig() {
        const config = {
            hiddenLayers: parseInt(this.elements.layersSlider.value),
            neuronsPerLayer: parseInt(this.elements.neuronsSlider.value),
            activation: this.elements.activationSelect.value,
            learningRate: parseFloat(this.elements.learningRateSlider.value) / 1000
        };
        
        // Add advanced settings if available
        if (this.elements.optimizerSelect) {
            config.optimizer = this.elements.optimizerSelect.value;
        }
        
        if (this.elements.batchSizeSlider) {
            config.batchSize = parseInt(this.elements.batchSizeSlider.value);
        }
        
        if (this.elements.regularizationSlider) {
            config.regularization = parseFloat(this.elements.regularizationSlider.value) / 10000;
        }
        
        // Update network configuration
        this.neuralNetwork.updateConfig(config);
        
        // Update visualization
        this.updateVisualization();
    }
    
    /**
     * Update UI elements with current values
     */
    updateUIValues() {
        const config = this.neuralNetwork.config;
        
        // Network architecture
        this.elements.layersSlider.value = config.hiddenLayers;
        this.elements.layersValue.textContent = config.hiddenLayers;
        
        this.elements.neuronsSlider.value = config.neuronsPerLayer;
        this.elements.neuronsValue.textContent = config.neuronsPerLayer;
        
        // Training parameters
        this.elements.learningRateSlider.value = config.learningRate * 1000;
        this.elements.learningRateValue.textContent = config.learningRate.toFixed(3);
        
        this.elements.activationSelect.value = config.activation;
        
        // Advanced settings
        if (this.elements.optimizerSelect) {
            this.elements.optimizerSelect.value = config.optimizer;
        }
        
        if (this.elements.batchSizeSlider) {
            this.elements.batchSizeSlider.value = config.batchSize;
            this.elements.batchSizeValue.textContent = config.batchSize;
        }
        
        if (this.elements.regularizationSlider) {
            this.elements.regularizationSlider.value = config.regularization * 10000;
            this.elements.regularizationValue.textContent = config.regularization.toFixed(4);
        }
        
        // Stats
        this.updateStats();
    }
    
    /**
     * Update stats display
     */
    updateStats() {
        const stats = this.neuralNetwork.stats;
        
        this.elements.epochValue.textContent = stats.epoch;
        this.elements.lossValue.textContent = stats.loss;
        this.elements.accuracyValue.textContent = stats.accuracy + '%';
    }
    
    /**
     * Update visualization
     */
    updateVisualization() {
        // Get network state
        const networkState = this.neuralNetwork.getNetworkState();
        
        // Draw network
        this.visualizer.drawNetwork(networkState);
        
        // Generate and draw decision boundary
        const boundaryData = this.neuralNetwork.generateDecisionBoundary(50);
        this.visualizer.drawDecisionBoundary(boundaryData);
    }
    
    /**
     * Start training the network
     */
    async startTraining() {
        if (this.state.isTraining) return;
        
        this.state.isTraining = true;
        this.elements.trainBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Training';
        this.elements.trainBtn.classList.add('active');
        
        // Disable other controls during training
        this.setControlsEnabled(false);
        
        // Get current dataset
        const dataset = this.datasetGenerator.getDataset(this.state.currentDataset);
        
        // Define training callback
        const onEpochEnd = async (epoch, logs) => {
            // Update stats
            this.updateStats();
            
            // Update visualization every few epochs to avoid freezing the UI
            if (epoch % 5 === 0) {
                this.updateVisualization();
                
                // Allow UI to update
                await new Promise(resolve => setTimeout(resolve, 0));
            }
            
            // Check if training should stop
            return !this.state.isTraining;
        };
        
        try {
            // Start training
            await this.neuralNetwork.train(dataset.x, dataset.y, 1000, onEpochEnd);
        } catch (error) {
            console.error('Training error:', error);
        } finally {
            // Update UI after training
            this.stopTraining();
        }
    }
    
    /**
     * Stop training the network
     */
    stopTraining() {
        this.state.isTraining = false;
        this.elements.trainBtn.innerHTML = '<i class="fas fa-play"></i> Train Network';
        this.elements.trainBtn.classList.remove('active');
        
        // Re-enable controls
        this.setControlsEnabled(true);
        
        // Final visualization update
        this.updateVisualization();
    }
    
    /**
     * Reset the network
     */
    resetNetwork() {
        this.neuralNetwork.reset();
        this.updateUIValues();
        this.updateVisualization();
    }
    
    /**
     * Enable or disable controls during training
     * @param {Boolean} enabled - Whether controls should be enabled
     */
    setControlsEnabled(enabled) {
        const controls = [
            this.elements.layersSlider,
            this.elements.neuronsSlider,
            this.elements.learningRateSlider,
            this.elements.activationSelect,
            this.elements.optimizerSelect,
            this.elements.batchSizeSlider,
            this.elements.regularizationSlider,
            this.elements.resetBtn
        ];
        
        controls.forEach(control => {
            if (control) {
                control.disabled = !enabled;
            }
        });
        
        // Dataset buttons
        this.elements.datasetBtns.forEach(btn => {
            btn.disabled = !enabled;
        });
    }
    
    /**
     * Save the model to a file
     */
    async saveModel() {
        try {
            // Disable controls during save
            this.setControlsEnabled(false);
            
            // Get model JSON
            const modelJSON = await this.neuralNetwork.saveModel();
            
            // Create a download link
            const blob = new Blob([modelJSON], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Create a temporary link element and trigger download
            const a = document.createElement('a');
            a.href = url;
            a.download = `neural-network-model-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                this.setControlsEnabled(true);
            }, 100);
            
        } catch (error) {
            console.error('Error saving model:', error);
            alert('Failed to save model: ' + error.message);
            this.setControlsEnabled(true);
        }
    }
    
    /**
     * Load the model from a file
     * @param {File} file - The model file
     */
    async loadModelFromFile(file) {
        try {
            // Disable controls during load
            this.setControlsEnabled(false);
            
            // Read the file
            const reader = new FileReader();
            
            reader.onload = async (event) => {
                try {
                    const jsonString = event.target.result;
                    
                    // Load the model
                    await this.neuralNetwork.loadModel(jsonString);
                    
                    // Update UI to reflect loaded model
                    this.updateUIValues();
                    
                    // Update visualization
                    this.updateVisualization();
                    
                    // Reset the file input
                    this.elements.modelFileInput.value = '';
                    
                    // Enable controls
                    this.setControlsEnabled(true);
                    
                    // Show success message
                    const toast = document.createElement('div');
                    toast.className = 'toast success';
                    toast.textContent = 'Model loaded successfully!';
                    document.body.appendChild(toast);
                    
                    // Remove toast after delay
                    setTimeout(() => {
                        if (toast.parentNode) {
                            toast.parentNode.removeChild(toast);
                        }
                    }, 3000);
                    
                } catch (error) {
                    console.error('Error processing model file:', error);
                    alert('Failed to load model: ' + error.message);
                    this.setControlsEnabled(true);
                }
            };
            
            reader.onerror = () => {
                console.error('Error reading file');
                alert('Failed to read model file');
                this.setControlsEnabled(true);
            };
            
            // Start reading the file
            reader.readAsText(file);
            
        } catch (error) {
            console.error('Error loading model:', error);
            alert('Failed to load model: ' + error.message);
            this.setControlsEnabled(true);
        }
    }
} 