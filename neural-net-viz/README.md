# Neural Network Visualizer

An interactive visualization tool for understanding how neural networks learn, built with JavaScript and TensorFlow.js. This project allows you to experiment with neural network architectures, training parameters, and different datasets in real-time.

## Features

- **Interactive Neural Network Visualization**: See the neural network architecture and how weights and activations change during training
- **Real-time Decision Boundary Visualization**: Watch how the network learns to classify data points
- **Multiple Dataset Types**: Experiment with XOR, Circle, Spiral patterns, or create your own custom dataset
- **Adjustable Network Parameters**: Change the number of layers, neurons, learning rate, and activation functions
- **Advanced Options**: Customize batch size, regularization, and optimizers
- **Responsive Design**: Works on desktop and mobile devices
- **Beautiful UI**: Modern, cyberpunk-inspired design with animation effects

## Technologies Used

- **TensorFlow.js**: For neural network creation, training, and inference
- **Canvas API**: For rendering visualizations
- **Modern JavaScript**: ES6+ features with object-oriented principles
- **HTML5/CSS3**: Modern styling with CSS variables

## How It Works

1. **Network Architecture**: The visualization shows neurons as circles and connections as lines. Connection strength is represented by line thickness and color.
2. **Decision Boundary**: The plot shows how the network divides the input space for classification tasks.
3. **Training Process**: Press "Train Network" to start the training process and watch the network learn in real-time.
4. **Custom Datasets**: Draw your own data points to create custom classification problems.

## Learning Concepts

This visualization demonstrates several machine learning concepts:

- Neural network architecture and forward propagation
- Weight initialization and activation functions
- Training with gradient descent and backpropagation
- Decision boundaries in classification problems
- Effects of hyperparameters on model performance
- Overfitting and regularization

## Project Structure

- `index.html` - Main HTML structure
- `style.css` - Styling and animations
- `js/`
  - `main.js` - Application initialization
  - `neural-network.js` - TensorFlow.js implementation
  - `visualizer.js` - Canvas rendering logic
  - `datasets.js` - Data generation
  - `ui-controller.js` - User interface handling
  - `matrix-background.js` - Background effect

## Getting Started

1. Open the `index.html` file in a modern web browser
2. Experiment with different network configurations
3. Select a dataset or create your own
4. Click "Train Network" to start the learning process
5. Watch how the neural network learns!

## Credits

Created by Abhinav Singh as a portfolio project, built with TensorFlow.js. 