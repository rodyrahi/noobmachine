async function modeluploaded() {


    




    const uploadmodel = document.getElementById("model");

    var jsonmodel = uploadmodel.files[0];



    var inputCount = 0;
    var csvInputs = [];

    while (true) {
      var inputId = "input" + inputCount;
      var inputElement = document.getElementById(inputId);
      
      if (!inputElement) {
        break; // Exit the loop if there are no more inputs with the current ID
      }
      
      csvInputs.push(parseFloat(inputElement.value));
      inputCount++;
    }


    
 

    // Load the model
const model = await tf.loadLayersModel('model.json');

// Prepare the input data for prediction





// const inputData = tf.tensor2d([[90, 11]], [1, 2]);

// Make a prediction
newInput = tf.div(tf.sub(tf.tensor1d([56,3.3]), xsMean), xsStd);
        
// Predict the price
const normalizedPrediction = model.predict(newInput.reshape([1, 2]));
const denormalizedPrediction = tf.mul(normalizedPrediction, ysStd).add(ysMean);
const price = denormalizedPrediction.dataSync()[0];
// Display or process the prediction results
console.log(price);
 model.summary();
}