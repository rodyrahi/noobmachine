
function visualizeANN(model) {
    const svg = d3
      .select("body")
      .append("svg")
      .attr("width", 600)
      .attr("height", 400);
  

      const layers = model.layers.map((layer) => layer.config);

      const layerCount = layers.length;
  
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    // Calculate the max number of neurons in a single layer
    const maxNeurons = d3.max(layers, (layer) => layer.units);
  
    // Calculate the spacing for layers and neurons
    const layerSpacing = width / layerCount;
    const neuronSpacing = height / maxNeurons;
  
    // Function to calculate the x-coordinate for a layer
    const layerX = (i) => i * layerSpacing;
  
    // Function to calculate the y-coordinate for a neuron
    const neuronY = (i) => height - i * neuronSpacing;
  
    // Draw the connections between neurons
    for (let i = 1; i < layerCount; i++) {
      const currentLayer = layers[i];
      const previousLayer = layers[i - 1];
  
      const currentLayerX = layerX(i);
      const previousLayerX = layerX(i - 1);
  
      for (let j = 0; j < currentLayer.units; j++) {
        const currentNeuronY = neuronY(j);
  
        for (let k = 0; k < previousLayer.units; k++) {
          const previousNeuronY = neuronY(k);
  
          const weight = model.getWeights()[2 * (i - 1)].get(k, j).toFixed(2);
          const color = weight > 0 ? "green" : "red";
  
          svg
            .append("line")
            .attr("x1", previousLayerX)
            .attr("y1", previousNeuronY)
            .attr("x2", currentLayerX)
            .attr("y2", currentNeuronY)
            .attr("stroke", color)
            .attr("stroke-width", Math.abs(weight) * 2);
        }
      }
    }
  
    // Draw the neurons
    for (let i = 0; i < layerCount; i++) {
      const layer = layers[i];
      const layerXPosition = layerX(i);
  
      for (let j = 0; j < layer.units; j++) {
        const neuronYPosition = neuronY(j);
  
        svg
          .append("circle")
          .attr("cx", layerXPosition)
          .attr("cy", neuronYPosition)
          .attr("r", 10)
          .attr("fill", "steelblue");
      }
    }
  }