const synaptic = require("synaptic");
const { Layer, Network } = synaptic;

// تعریف لایه‌ها
const inputLayer = new Layer(2);
const hiddenLayer = new Layer(3);
const outputLayer = new Layer(1);

// اتصال لایه‌ها
inputLayer.project(hiddenLayer);
hiddenLayer.project(outputLayer);

// ساخت شبکه
const myNetwork = new Network({
  input: inputLayer,
  hidden: [hiddenLayer],
  output: outputLayer,
});

// آموزش شبکه
const learningRate = 0.1;
for (let i = 0; i < 20000; i++) {
  myNetwork.activate([0, 0]);
  myNetwork.propagate(learningRate, [0]);

  myNetwork.activate([0, 1]);
  myNetwork.propagate(learningRate, [1]);

  myNetwork.activate([1, 0]);
  myNetwork.propagate(learningRate, [1]);

  myNetwork.activate([1, 1]);
  myNetwork.propagate(learningRate, [0]);
}

// پیش‌بینی
console.log("Prediction for [0, 1]:", myNetwork.activate([0, 1])); // نزدیک به 1
