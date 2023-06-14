
var savemodel
var normalizedInput
var xsMean 
var xsStd 

var ysMean 
var ysStd 


async function processCSV() {
  getlayerValues()
  const csvFile = document.getElementById("csvFile");

  if (csvFile.files.length === 0) {
    alert('Please Select an .CSV file');
  } else {


   


    var csvInputs = [];
    var parentDiv = document.getElementById("params");
    var inputElements = parentDiv.querySelectorAll('input')
   console.log(inputElements);
    
    for (var i = 0; i < inputElements.length; i++) {
      csvInputs.push(parseFloat(inputElements[i].value));
    }
    console.log(csvInputs);



        const units = parseInt(document.getElementById("units").value);
        const inputshape = document.getElementById("inputshape");
        const learningrate = parseFloat(document.getElementById("learningRate").value);
        const epochs = parseFloat(document.getElementById("epochs").value);
        const activation = document.getElementById("activation").value;
        const lossFunctionSelect = document.getElementById("lossFunctionSelect").value;
        // lossFunctionSelect
        console.log(units);
        console.log(learningrate);
        console.log(epochs);
        console.log(activation);


        document.getElementById('prediction').innerHTML = `<div class="spinner-border" role="status"></div>`;

         const input = csvFile.files[0];
         const reader = new FileReader();

   

         reader.onload = async function (e) {
          const text = e.target.result;


          const lines = text.split('\n');
          const xs = [];
          const ys = [];
          let inputs;
        
          for (let i = 0; i < lines.length; i++) {
            const data = lines[i].split(',').map(parseFloat);
            if (data.some(isNaN)) {
              console.log('Invalid data point:', lines[i]);
              continue;
            }
            inputs = data.slice(0, -1);

            const valueSelect = document.getElementById('predict-param').options[document.getElementById('predict-param').selectedIndex].value
            const header = lines[0].split(",");

            var paramindex 
            header.forEach((element , index) => {
              if (element.replace(/\s/g, "") === valueSelect.replace(/\s/g, "")) {
                paramindex = index
              }
            });
            

            var features = data.filter((_, i) => i !== paramindex);
     
            // const features = data.slice(0, -1); // Extract all but the last element as features
            var target = data.filter((_, i) => i == paramindex);
            console.log(paramindex);
        
            xs.push(features); // Store features
            ys.push(target); // Store target
          }


          try {
            

        
          xsMean = tf.mean(tf.tensor2d(xs), 0);
          xsStd = tf.sqrt(tf.mean(tf.square(tf.sub(tf.tensor2d(xs), xsMean)), 0));
        
          ysMean = tf.mean(tf.tensor2d(ys), 0);
          ysStd = tf.sqrt(tf.mean(tf.square(tf.sub(tf.tensor2d(ys), ysMean)), 0));
        



          // Normalize the training data
          const normalizedXs = tf.div(tf.sub(tf.tensor2d(xs), xsMean), xsStd);
          const normalizedYs = tf.div(tf.sub(tf.tensor2d(ys), ysMean), ysStd);
        
          console.log(normalizedXs);
          // Create a TensorFlow.js model
          const model = tf.sequential();


          layers.forEach((element , index) => {
            
            if (index === 0) {
              model.add(tf.layers.dense({ units: parseInt(element.units), inputShape: [inputs.length], activation: element.activation }));
            }
            else{
            model.add(tf.layers.dense({ units: parseInt(element.units), inputShape: parseInt(layers[index-1].units), activation: element.activation }));
            }
        
        });
          model.add(tf.layers.dense({ units: 1 }));
        
          var trainalgo = document.getElementById('algorithmSelect').value

          if (trainalgo === 'sgd') {
            model.compile({ loss: lossFunctionSelect, optimizer: tf.train.sgd(learningrate) });

          } else if( trainalgo === 'adam'){
            model.compile({ loss: lossFunctionSelect, optimizer: tf.train.adam(learningrate) });

          } else{
            model.compile({ loss: lossFunctionSelect, optimizer: tf.train.rmspro(learningrate) });

          } 
        
          
          // Train the model
          await model.fit(normalizedXs, normalizedYs, { epochs: epochs });
        

          // Normalize an arbitrary input value for prediction

          xsMean = Array.from(await xsMean.data());
          xsStd = Array.from(await xsStd.data());
          ysMean = Array.from(await ysMean.data());
           ysStd = Array.from(await ysStd.data());
           console.log(xsMean , xsStd,ysMean,ysStd);

          normalizedInput = tf.div(tf.sub(tf.tensor1d(csvInputs), xsMean), xsStd);
        
          console.log(normalizedInput.data());
          // Predict the price
          const normalizedPrediction = model.predict(normalizedInput.reshape([1, inputs.length]));
          const denormalizedPrediction = tf.mul(normalizedPrediction, ysStd).add(ysMean);
          const price = denormalizedPrediction.dataSync()[0];
        
          console.log('Predicted price:', price);



          document.getElementById('prediction').innerText = 'Prediction : ' + Math.round(price);
          document.getElementById('prediction').innerHTML +=`<br>
          <button class="btn btn-success btn-sm " style="border: 2px black solid;"  onclick="downloadCSV()">Download</button>`

          savemodel = model
          // document.getElementById("xsmean").value=xsMean
          // document.getElementById("xsstd").value=xsStd
          // document.getElementById("ysmean").value=ysMean
          // document.getElementById("ysstd").value=ysStd


        } catch (error) {
          // document.getElementById('log').innerHTML = error
            console.log(error);
        }
        


        };
        

         reader.readAsText(input);

         // visualizeANN(model)
    
        }

}

function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

const randomString = generateRandomString(3);

async function downloadCSV() {

  await savemodel.save(`downloads://model-${randomString}`);
          console.log('Model saved.');
}

async function uploadCSV() {


  const response = await fetch('/uploadmodel', {
    method: 'POST',
    body: savemodel
  });

  const username = document.getElementById('username').innerText
  const randomString = Math.random().toString(36).substring(7);
  const modelPath = 'model-' + randomString;

  // Save the model to a file using tfjs-node
  await tf.node.io.fileSystem('public/uploads/models/' + modelPath).save(model);

  console.log('Model uploaded.');
}


