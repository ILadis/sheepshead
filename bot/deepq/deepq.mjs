
import { default as brain } from 'brain.js';

export function Network(...args) {
  if (args.length) {
    let inputSize = args.shift();
    let outputSize = args.pop();

    var network = new brain.NeuralNetwork({
      inputSize: inputSize,
      hiddenLayers: args,
      outputSize: outputSize,
    });

    network.initialize();
  }

  this.delegate = network;
}

Network.from = function(object) {
  let network = new Network();
  network.delegate = new brain.NeuralNetwork();
  network.delegate.fromJSON(object);
  return network;
};

Network.prototype.activate = function(input) {
  return this.delegate.runInput(input);
};

Network.prototype.propagate = function(rate, momentum, target) {
  this.delegate.trainOpts.learningRate = rate;
  this.delegate.trainOpts.momentum = momentum;
  this.delegate.calculateDeltas(target);
  this.delegate.adjustWeights();
};

Network.prototype.serialize = function() {
  return this.delegate.toJSON();
};

Network.prototype.clone = function() {
  return Network.from(this.serialize());
};

export function ReplayMemory(capacity, batch) {
  this.experiences = new Array(capacity);
  this.batch = batch;
  this.size = 0;
}

ReplayMemory.prototype.save = function(experience) {
  let capacity = this.experiences.length;
  if (capacity <=  0) {
    return false;
  }

  this.experiences[this.size % capacity] = experience;
  return ++this.size;
};

ReplayMemory.prototype.sample = function() {
  let capacity = this.experiences.length;
  if (capacity <= 0) {
    return false;
  }

  if (this.size >= this.batch) {
    let batch = new Array(this.batch);
    let length = Math.min(this.size, capacity);

    for (let i = 0; i < batch.length; i++) {
      let index = Math.floor(Math.random() * length);
      batch[i] = this.experiences[index];
    }

    return batch;
  }
};

export function GreedyStrategy(start, end, decay) {
  this.start = start;
  this.end = end;
  this.decay = decay;
}

GreedyStrategy.prototype.wantExplore = function() {
  let steps = this.steps || 0;

  let value = Math.random();
  let decay = Math.exp(-1 * steps * this.decay);

  let explore = this.end + (this.start - this.end) * decay;

  this.steps = steps + 1;

  return explore > value;
};

