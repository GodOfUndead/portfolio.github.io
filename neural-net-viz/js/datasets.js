/**
 * Datasets for neural network training
 * Provides various data patterns for classification problems
 */
class DatasetGenerator {
    constructor() {
        // Custom dataset storage
        this.customDataset = {
            x: [],
            y: []
        };
        
        // Default data range
        this.dataRange = [-1, 1];
    }
    
    /**
     * Generate XOR dataset
     * @param {Number} numPoints - Number of points to generate
     * @param {Number} noise - Noise level [0, 1]
     * @returns {Object} - Training data
     */
    generateXOR(numPoints = 100, noise = 0.1) {
        const xData = [];
        const yData = [];
        
        for (let i = 0; i < numPoints; i++) {
            // Generate random point in [-1, 1] x [-1, 1]
            const x1 = Math.random() * 2 - 1;
            const x2 = Math.random() * 2 - 1;
            
            // XOR function with noise
            const noiseValue = (Math.random() * 2 - 1) * noise;
            const y = (x1 * x2 > 0) ? 1 : 0;
            
            // Add noise by potentially flipping labels
            const noisyY = (Math.random() < noise) ? 1 - y : y;
            
            xData.push([x1, x2]);
            yData.push([noisyY]);
        }
        
        return { x: xData, y: yData };
    }
    
    /**
     * Generate circle dataset
     * @param {Number} numPoints - Number of points to generate
     * @param {Number} noise - Noise level [0, 1]
     * @returns {Object} - Training data
     */
    generateCircle(numPoints = 100, noise = 0.1) {
        const xData = [];
        const yData = [];
        
        // Circle parameters
        const radius = 0.5;
        const centerX = 0;
        const centerY = 0;
        
        for (let i = 0; i < numPoints; i++) {
            // Generate random point in [-1, 1] x [-1, 1]
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random();
            
            const x1 = distance * Math.cos(angle);
            const x2 = distance * Math.sin(angle);
            
            // Points inside the circle are class 0, outside are class 1
            const distanceFromCenter = Math.sqrt(x1 * x1 + x2 * x2);
            const y = distanceFromCenter < radius ? 0 : 1;
            
            // Add noise by potentially flipping labels
            const noisyY = (Math.random() < noise) ? 1 - y : y;
            
            xData.push([x1, x2]);
            yData.push([noisyY]);
        }
        
        return { x: xData, y: yData };
    }
    
    /**
     * Generate spiral dataset
     * @param {Number} numPoints - Number of points to generate
     * @param {Number} noise - Noise level [0, 1]
     * @returns {Object} - Training data
     */
    generateSpiral(numPoints = 100, noise = 0.1) {
        const xData = [];
        const yData = [];
        
        // Points per class
        const pointsPerClass = Math.floor(numPoints / 2);
        
        // Generate two spirals
        for (let i = 0; i < pointsPerClass; i++) {
            // First spiral (class 0)
            const r1 = i / pointsPerClass * 0.8;
            const angle1 = i / pointsPerClass * 3 * Math.PI + Math.PI;
            
            const x1 = r1 * Math.sin(angle1) + (Math.random() * 2 - 1) * noise;
            const y1 = r1 * Math.cos(angle1) + (Math.random() * 2 - 1) * noise;
            
            xData.push([x1, y1]);
            yData.push([0]);
            
            // Second spiral (class 1)
            const r2 = i / pointsPerClass * 0.8;
            const angle2 = i / pointsPerClass * 3 * Math.PI;
            
            const x2 = r2 * Math.sin(angle2) + (Math.random() * 2 - 1) * noise;
            const y2 = r2 * Math.cos(angle2) + (Math.random() * 2 - 1) * noise;
            
            xData.push([x2, y2]);
            yData.push([1]);
        }
        
        return { x: xData, y: yData };
    }
    
    /**
     * Generate moons dataset (similar to sklearn's make_moons)
     * @param {Number} numPoints - Number of points to generate
     * @param {Number} noise - Noise level [0, 1]
     * @returns {Object} - Training data
     */
    generateMoons(numPoints = 100, noise = 0.1) {
        const xData = [];
        const yData = [];
        
        // Points per class
        const pointsPerClass = Math.floor(numPoints / 2);
        
        for (let i = 0; i < pointsPerClass; i++) {
            // First moon (class 0)
            const angle1 = i / pointsPerClass * Math.PI;
            const x1 = Math.cos(angle1) + (Math.random() * 2 - 1) * noise;
            const y1 = Math.sin(angle1) + (Math.random() * 2 - 1) * noise;
            
            xData.push([x1, y1]);
            yData.push([0]);
            
            // Second moon (class 1)
            const angle2 = i / pointsPerClass * Math.PI;
            const x2 = 1 - Math.cos(angle2) + (Math.random() * 2 - 1) * noise;
            const y2 = 1 - Math.sin(angle2) - 0.5 + (Math.random() * 2 - 1) * noise;
            
            xData.push([x2, y2]);
            yData.push([1]);
        }
        
        // Scale to [-1, 1] range
        const xValues = xData.flatMap(d => d);
        const minX = Math.min(...xValues);
        const maxX = Math.max(...xValues);
        
        const scale = 2 / (maxX - minX);
        const offset = -1 - minX * scale;
        
        // Apply scaling
        for (let i = 0; i < xData.length; i++) {
            xData[i][0] = xData[i][0] * scale + offset;
            xData[i][1] = xData[i][1] * scale + offset;
        }
        
        return { x: xData, y: yData };
    }
    
    /**
     * Add a point to the custom dataset
     * @param {Number} x - X coordinate
     * @param {Number} y - Y coordinate
     * @param {Number} classLabel - Class label (0 or 1)
     */
    addCustomPoint(x, y, classLabel) {
        // Scale coordinates to [-1, 1] range
        const scaledX = (x - 0.5) * 2;
        const scaledY = (y - 0.5) * 2;
        
        this.customDataset.x.push([scaledX, scaledY]);
        this.customDataset.y.push([classLabel]);
    }
    
    /**
     * Get the custom dataset
     * @returns {Object} - Training data
     */
    getCustomDataset() {
        if (this.customDataset.x.length === 0) {
            // If custom dataset is empty, return a default dataset
            return this.generateXOR();
        }
        return { ...this.customDataset };
    }
    
    /**
     * Clear the custom dataset
     */
    clearCustomDataset() {
        this.customDataset = {
            x: [],
            y: []
        };
    }
    
    /**
     * Get a dataset by name
     * @param {String} datasetName - Name of the dataset
     * @returns {Object} - Training data
     */
    getDataset(datasetName) {
        switch (datasetName) {
            case 'xor':
                return this.generateXOR();
            case 'circle':
                return this.generateCircle();
            case 'spiral':
                return this.generateSpiral();
            case 'moons':
                return this.generateMoons();
            case 'custom':
                return this.getCustomDataset();
            default:
                return this.generateXOR();
        }
    }
} 