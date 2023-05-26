
var savemodel

async function processCSV() {

  

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
    console.log(csvInputs);



        const units = parseInt(document.getElementById("units").value);
        const inputshape = document.getElementById("inputshape");
        const learningrate = parseFloat(document.getElementById("learningRate").value);
        const epochs = parseFloat(document.getElementById("epochs").value);
        const activation = document.getElementById("activation").value;

        console.log(units);
        console.log(learningrate);
        console.log(epochs);
        console.log(activation);


        document.getElementById('prediction').innerHTML = `<div class="spinner-border" role="status"></div>`;

         const csvFile = document.getElementById("csvFile");
         const input = csvFile.files[0];
         const reader = new FileReader();

   

         reader.onload = async function (e) {
          const text = e.target.result;

 

            dfd.readCSV(input) //assumes file is in CWD
              .then(df => {
                document.getElementById('output').innerText = df;

              

              }).catch(err=>{
                console.log(err);
              })

        
          const lines = text.split('\n');
          const xs = [];
          const ys = [];
          let inputs;
        
          for (let i = 1; i < lines.length; i++) {
            const data = lines[i].split(',').map(parseFloat);
            if (data.some(isNaN)) {
              console.log('Invalid data point:', lines[i]);
              continue;
            }
            inputs = data.slice(0, -1);
            const features = data.slice(0, -1); // Extract all but the last element as features
            const target = [data[data.length - 1]]; // Last element is the target
        
            xs.push(features); // Store features
            ys.push(target); // Store target
          }



          
        
          const xsMean = tf.mean(tf.tensor2d(xs), 0);
          const xsStd = tf.sqrt(tf.mean(tf.square(tf.sub(tf.tensor2d(xs), xsMean)), 0));
        
          const ysMean = tf.mean(tf.tensor2d(ys), 0);
          const ysStd = tf.sqrt(tf.mean(tf.square(tf.sub(tf.tensor2d(ys), ysMean)), 0));
        
          // Normalize the training data
          const normalizedXs = tf.div(tf.sub(tf.tensor2d(xs), xsMean), xsStd);
          const normalizedYs = tf.div(tf.sub(tf.tensor2d(ys), ysMean), ysStd);
        
          // Create a TensorFlow.js model
          const model = tf.sequential();



          model.add(tf.layers.dense({ units: units, inputShape: [inputs.length], activation: activation }));
          model.add(tf.layers.dense({ units: 1 }));
        
          model.compile({ loss: 'meanSquaredError', optimizer: tf.train.sgd(learningrate) });
        
          // Train the model
          await model.fit(normalizedXs, normalizedYs, { epochs: epochs });
        

          // Normalize an arbitrary input value for prediction

          const normalizedInput = tf.div(tf.sub(tf.tensor1d(csvInputs), xsMean), xsStd);
        
          // Predict the price
          const normalizedPrediction = model.predict(normalizedInput.reshape([1, inputs.length]));
          const denormalizedPrediction = tf.mul(normalizedPrediction, ysStd).add(ysMean);
          const price = denormalizedPrediction.dataSync()[0];
        
          console.log('Predicted price:', price);
          document.getElementById('prediction').innerText = 'Prediction : ' + price;
          document.getElementById('prediction').innerHTML +=`<br>
          <button class="btn btn-success m-2 mx-1" onclick="downloadCSV()">Download</button>`

          savemodel = model

        };
        

         reader.readAsText(input);

         // visualizeANN(model)


}

async function downloadCSV() {


  await savemodel.save('downloads://my_model');
          console.log('Model saved.');
}