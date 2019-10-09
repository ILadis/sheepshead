
import Neataptic from 'neataptic';

function clone(network) {
  let json  = network.toJSON();
  return Neataptic.Network.fromJSON(json);
}

export function DeepQNet(args) {
  if (!Array.isArray(args)) {
    var network = Neataptic.Network.fromJSON(args);
  } else {
    var network = new Neataptic.architect.Perceptron(...args);
    for (let node of network.nodes) {
      if (node.type == 'output') {
        node.squash = Neataptic.methods.activation.IDENTITY;
      }
    }
  }
  this.policy = network;
  this.target = clone(network);
}

DeepQNet.prototype.predict = function(input) {
  return this.policy.noTraceActivate(input);
};

DeepQNet.prototype.optimize = function(experiences) {
  for (let exp of experiences) {
    let { state, action, reward, next } = exp;

    let max = 0;
    if (next) {
      let output = this.target.noTraceActivate(next);
      max = output.reduce((p, v) => p > v ? p : v);
    }

    let discount = 0.7;
    let value = reward + discount * max;

    let rate = 0.001;
    let momentum = 0;

    let output = this.policy.activate(state);
    output[action] = value;

    this.policy.propagate(rate, momentum, true, output);
  }
};

DeepQNet.prototype.evolve = function() {
  this.target = clone(this.policy);
};

DeepQNet.prototype.serialize = function(extra) {
  let json = this.policy.toJSON();
  Object.assign(json, extra);
  return JSON.stringify(json);
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

