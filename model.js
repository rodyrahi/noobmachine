const tf = require('@tensorflow/tfjs');



const fs = require('fs');



var price = 0

// Load the dataset
const data = fs.readFileSync('data/data.csv', 'utf8');
const lines = data.trim().split('\n');

const xs = [];
const ys = [];

for (let i = 0; i < lines.length; i++) {
  const [length, area, price] = lines[i].split(',').map(parseFloat);
  if (isNaN(length) || isNaN(area) || isNaN(price)) {
    console.log('Invalid data point:', lines[i]);
    continue;
  }
  xs.push([(length - 100) / 50, (area - 3) / 1.5]); // normalize input data
  ys.push([(price - 200) / 100]); // normalize target data
}

// Create TensorFlow.js tensors
const xsTensor = tf.tensor2d(xs);
const ysTensor = tf.tensor2d(ys);

// Create a TensorFlow.js model
const model = tf.sequential();





model.add(tf.layers.dense({units: 50, inputShape: [2], activation: 'relu'})); // increase number of units and add activation function
model.add(tf.layers.dense({units: 1}));

model.compile({loss: 'meanSquaredError', optimizer: tf.train.sgd(0.01)}); // increase learning rate


model.fit(xsTensor, ysTensor, {epochs: 1000}).then(async() => {
    const prediction = model.predict(tf.tensor2d([[(result[0].distance - 100) / 50, (truckcost - 3) / 1.5]])); 
    price = prediction.dataSync()[0] * 100 + 200;
    console.log('Predicted price:', price);

  });


module.exports = {model , tf , xsTensor , ysTensor};