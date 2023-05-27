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
const model = await tf.loadLayersModel('my_model.json');

// Prepare the input data for prediction
const inputData = tf.tensor2d([[56 , 3.3]], [1,2]);

// Make a prediction
const predictions = model.predict(inputData);

// Get the prediction results
const predictionValues = predictions.arraySync()[0];

// Display or process the prediction results
console.log(predictionValues);
// model.summary();
}