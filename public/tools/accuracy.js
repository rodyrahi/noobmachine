async function getAccuracy(lines, xsMean,xsStd,ysMean,ysStd) {
    var csvInputs = [];
    var parentDiv = document.getElementById("params");
    var inputElements = parentDiv.querySelectorAll('input')
    console.log(inputElements);
    
    for (var i = 0; i < inputElements.length; i++) {
      csvInputs.push(parseFloat(inputElements[i].value));
    }
    console.log(csvInputs);



    var xtest=[]
    var ytest=[]
    var ypredictions=[]
    var absoluteDiff=[]
    var ape=[]

  for (let index = 0; index < lines.length; index++) {
    const data = lines[index].split(',').map(parseFloat);

    const valueSelect = document.getElementById('predict-param').options[document.getElementById('predict-param').selectedIndex].value
          const header = lines[0].split(",");

          var paramindex 
          header.forEach((element , index) => {
            if (element.replace(/\s/g, "") === valueSelect.replace(/\s/g, "")) {
              paramindex = index
            }
          });


    var features = data.filter((_, i) => i !== paramindex);
    var target = data.filter((_, i) => i == paramindex);
   
   xtest.push(features)
   ytest.push(target)

    
  }

  xtest=splitArray(xtest ,0.7)[1]
  ytest=splitArray(ytest ,0.7)[1]


  console.log(xtest);

  const model = await tf.loadLayersModel('model-pNk.json');



  xtest.forEach((element,index) => {
  newInput = tf.div(tf.sub(tf.tensor1d(element), xsMean), xsStd);
          
  // Predict the price
  const normalizedPrediction = model.predict(newInput.reshape([1, csvInputs.length]));
  const denormalizedPrediction = tf.mul(normalizedPrediction, ysStd).add(ysMean);
  const price = denormalizedPrediction.dataSync()[0];
  // Display or process the prediction results
  ypredictions.push(price)
  });

  ypredictions.forEach((element,index) => {
    absoluteDiff.push(parseFloat(element)-parseFloat(ytest[index]))
  });

  absoluteDiff.forEach((element,index) => {
    ape.push((element/ytest[index])*100)
    
  });
  console.log(ypredictions);
  console.log(absoluteDiff);
  console.log(ape);

  let sum = 0;

  for (let i = 0; i < ape.length; i++) {
    if (ape[i]) {
      sum += ape[i];
      sum = sum/ape.length
      sum=100-sum

    }
  }

  return sum;
}