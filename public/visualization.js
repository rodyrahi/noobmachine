
  
const inputfields = document.querySelectorAll('input');

// Attach oninput event listener to each input element
console.log(inputfields);

inputfields.forEach(function(input) {
  input.oninput = function() {


    console.log('change');
    drawANNLayers()
  };
});


const width = 600;
const height = 600;
const layerMargin = 100;
const nodeRadius = 10; // Adjust the node radius to make neurons smaller

// Create a SVG container using D3.js
const svg = d3.select('#ann-svg')
  .attr('width', width)
  .attr('height', height);

// Function to draw the ANN layers
function drawANNLayers() {

  svg.selectAll('.layer').remove();
  const units = parseInt(document.getElementById("units").value);
  const inputshape = parseInt(document.getElementById("inputshape").value);
  const activation = document.getElementById("activation").value;

  const modelArchitecture = [
    { layerType: 'input', units: inputshape },
    { layerType: 'dense', units: units, activation: activation },
    { layerType: 'dense', units: 1, activation: 'sigmoid' }
  ];

  console.log(modelArchitecture);
  // Calculate the x-position for each layer
  const layerXPositions = modelArchitecture.map((_, i) => (i + 1) * (width / (modelArchitecture.length + 1)));

  // Draw the layers
  const layers = svg.selectAll('.layer')
    .data(modelArchitecture)
    .enter()
    .append('g')
    .attr('class', 'layer')
    .attr('transform', (_, i) => `translate(${layerXPositions[i]}, ${height / 2})`);

  // Draw the nodes in each layer
  layers.each(function (d, i) {
    const layer = d3.select(this);

    // Calculate the y-position for each node
    const numNodes = d.units;
    const availableWidth = width / (modelArchitecture.length + 1) - 2 * layerMargin;
    const maxNeurons = Math.floor(availableWidth / (0.5 * nodeRadius));
    const adjustedNodeRadius = Math.min(maxNeurons, nodeRadius, availableWidth / (3 * numNodes));

    const nodeYPositions = d3.range(numNodes).map(j => (j + 1) * (height / (numNodes + 1)) - height / 2);

    // Draw the nodes
    const nodes = layer.selectAll('.node')
      .data(nodeYPositions)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('cx', 0)
      .attr('cy', d => d)
      .attr('r', adjustedNodeRadius*-1);

    // Add labels to the input layer nodes
    if (i === 0) {
      nodes.each(function () {
        const node = d3.select(this);
        const inputLabel = node.append('text')
          .text('Input')
          .attr('x', adjustedNodeRadius + 5)
          .attr('y', 5);
      });
    }

    // Add labels to the hidden and output layer nodes
    if (i > 0) {
      nodes.each(function () {
        const node = d3.select(this);
        const activationLabel = node.append('text')
          .text(d.activation)
          .attr('x', adjustedNodeRadius + 5)
          .attr('y', 5);
      });
    }
  });
}
