/**
 * Neural Network class that uses TensorFlow.js for computation
 * and provides API for training and visualization
 */
class NeuralNetwork {
    constructor(config = {}) {
        // Default configuration
        this.config = {
            inputSize: 2,                     // Input dimensions
            outputSize: 1,                    // Output dimensions
            hiddenLayers: 1,                  // Number of hidden layers
            neuronsPerLayer: 5,               // Neurons in each hidden layer
            activation: 'sigmoid',            // Activation function
            learningRate: 0.03,               // Learning rate for optimization
            batchSize: 8,                     // Batch size for training
            regularization: 0,                // L2 regularization factor
            optimizer: 'adam',                // Optimizer type
            ...config                         // Override with provided config
        };
        
        // Stats tracking
        this.stats = {
            epoch: 0,
            loss: 0,
            accuracy: 0
        };
        
        // Internal state for visualization
        this.layerOutputs = [];
        this.weightMatrices = [];
        
        // Build initial model
        this.buildModel();
    }
    
    /**
     * Build the TensorFlow.js model based on current configuration
     */
    buildModel() {
        // Clean up previous model if it exists
        if (this.model) {
            this.model.dispose();
        }
        
        const { inputSize, outputSize, hiddenLayers, neuronsPerLayer, activation } = this.config;
        
        // Create sequential model
        this.model = tf.sequential();
        
        // Add input layer
        this.model.add(tf.layers.dense({
            units: neuronsPerLayer,
            inputShape: [inputSize],
            activation,
            kernelRegularizer: this.config.regularization > 0 ? 
                tf.regularizers.l2({ l2: this.config.regularization }) : null
        }));
        
        // Add hidden layers
        for (let i = 0; i < hiddenLayers - 1; i++) {
            this.model.add(tf.layers.dense({
                units: neuronsPerLayer,
                activation,
                kernelRegularizer: this.config.regularization > 0 ? 
                    tf.regularizers.l2({ l2: this.config.regularization }) : null
            }));
        }
        
        // Add output layer (sigmoid for binary classification)
        this.model.add(tf.layers.dense({
            units: outputSize,
            activation: 'sigmoid'
        }));
        
        // Configure optimizer
        let optimizer;
        switch (this.config.optimizer) {
            case 'sgd':
                optimizer = tf.train.sgd(this.config.learningRate);
                break;
            case 'momentum':
                optimizer = tf.train.momentum(this.config.learningRate, 0.9);
                break;
            case 'adam':
            default:
                optimizer = tf.train.adam(this.config.learningRate);
                break;
        }
        
        // Compile model
        this.model.compile({
            optimizer,
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });
        
        // Initialize layer outputs and weight matrices arrays
        this.layerOutputs = Array(hiddenLayers + 1).fill(null);
        this.weightMatrices = Array(hiddenLayers + 1).fill(null);
        
        // Extract initial weights for visualization
        this.extractWeights();
    }
    
    /**
     * Update network configuration
     * @param {Object} newConfig - New configuration options
     * @param {boolean} rebuild - Whether to rebuild the model after updating
     */
    updateConfig(newConfig, rebuild = true) {
        Object.assign(this.config, newConfig);
        if (rebuild) {
            this.buildModel();
        }
    }
    
    /**
     * Train the network on the provided dataset
     * @param {Array} xData - Input data [n_samples, inputSize]
     * @param {Array} yData - Output data [n_samples, outputSize]
     * @param {Number} epochs - Number of training epochs
     * @param {Function} onEpochEnd - Callback for visualization updates
     */
    async train(xData, yData, epochs = 100, onEpochEnd = null) {
        const xs = tf.tensor2d(xData);
        const ys = tf.tensor2d(yData);
        
        try {
            // Train model
            const history = await this.model.fit(xs, ys, {
                epochs,
                batchSize: this.config.batchSize,
                shuffle: true,
                callbacks: {
                    onEpochEnd: async (epoch, logs) => {
                        // Update stats
                        this.stats.epoch = epoch + 1;
                        this.stats.loss = logs.loss.toFixed(4);
                        this.stats.accuracy = (logs.acc * 100).toFixed(2);
                        
                        // Extract current weights for visualization
                        this.extractWeights();
                        
                        // Call the onEpochEnd callback if provided
                        if (onEpochEnd) {
                            await onEpochEnd(epoch, logs);
                        }
                    }
                }
            });
            
            return history;
        } finally {
            // Clean up tensors
            xs.dispose();
            ys.dispose();
        }
    }
    
    /**
     * Make predictions on input data
     * @param {Array} xData - Input data [n_samples, inputSize]
     * @returns {Array} - Predictions
     */
    predict(xData) {
        return tf.tidy(() => {
            const xs = tf.tensor2d(xData);
            const preds = this.model.predict(xs);
            
            // Store layer outputs for visualization
            this.captureLayerOutputs(xs);
            
            // Convert to JavaScript arrays and return
            return preds.dataSync();
        });
    }
    
    /**
     * Generate decision boundary points for visualization
     * @param {Number} resolution - Grid resolution
     * @param {Array} xRange - Range for x axis [min, max]
     * @param {Array} yRange - Range for y axis [min, max]
     * @returns {Object} - Grid points and predictions
     */
    generateDecisionBoundary(resolution = 50, xRange = [-1, 1], yRange = [-1, 1]) {
        const xs = [];
        const gridX = [];
        const gridY = [];
        
        // Generate grid points
        for (let i = 0; i < resolution; i++) {
            const x = xRange[0] + (xRange[1] - xRange[0]) * i / (resolution - 1);
            gridX.push(x);
            
            for (let j = 0; j < resolution; j++) {
                const y = yRange[0] + (yRange[1] - yRange[0]) * j / (resolution - 1);
                if (i === 0) {
                    gridY.push(y);
                }
                
                xs.push([x, y]);
            }
        }
        
        // Get predictions for grid points
        const preds = this.predict(xs);
        
        return { gridX, gridY, predictions: preds };
    }
    
    /**
     * Extract weights from the model for visualization
     */
    extractWeights() {
        tf.tidy(() => {
            const weights = this.model.getWeights();
            
            // weights are organized as [layer0_weights, layer0_biases, layer1_weights, layer1_biases, ...]
            for (let i = 0; i < this.weightMatrices.length; i++) {
                const layerWeights = weights[i * 2]; // Skip bias tensors
                this.weightMatrices[i] = layerWeights.arraySync();
            }
        });
    }
    
    /**
     * Capture the outputs of each layer for a given input
     * @param {Tensor} inputTensor - Input tensor
     */
    captureLayerOutputs(inputTensor) {
        // Create a sub-model for each layer to capture its output
        for (let i = 0; i < this.model.layers.length; i++) {
            const subModel = tf.model({
                inputs: this.model.inputs,
                outputs: this.model.layers[i].output
            });
            
            const output = subModel.predict(inputTensor);
            this.layerOutputs[i] = output.arraySync();
        }
    }
    
    /**
     * Get the network's current state for visualization
     */
    getNetworkState() {
        return {
            config: this.config,
            stats: this.stats,
            weights: this.weightMatrices,
            layerOutputs: this.layerOutputs
        };
    }
    
    /**
     * Reset the network to initial state
     */
    reset() {
        this.stats = {
            epoch: 0,
            loss: 0,
            accuracy: 0
        };
        
        // Rebuild the model with the current configuration
        this.buildModel();
    }
    
    /**
     * Clean up resources when the network is no longer needed
     */
    dispose() {
        if (this.model) {
            this.model.dispose();
        }
    }
    
    /**
     * Save the model to a file
     * @returns {Promise<string>} - Promise that resolves with the model's JSON representation
     */
    async saveModel() {
        try {
            // Convert model to JSON format
            const modelJSON = await this.model.toJSON();
            
            // Include configuration and metadata
            const saveData = {
                modelJSON,
                config: this.config,
                stats: this.stats,
                createdAt: new Date().toISOString(),
                version: '1.0.0'
            };
            
            return JSON.stringify(saveData);
        } catch (error) {
            console.error('Error saving model:', error);
            throw error;
        }
    }
    
    /**
     * Load a model from JSON
     * @param {string} jsonString - The model JSON string
     * @returns {Promise<void>}
     */
    async loadModel(jsonString) {
        try {
            // Parse the saved data
            const saveData = JSON.parse(jsonString);
            
            // Update configuration
            this.updateConfig(saveData.config, false);
            
            // Load model architecture and weights
            this.model = await tf.models.modelFromJSON(saveData.modelJSON);
            
            // Update stats
            this.stats = saveData.stats;
            
            // Extract weights for visualization
            this.extractWeights();
            
            return true;
        } catch (error) {
            console.error('Error loading model:', error);
            throw error;
        }
    }
} 