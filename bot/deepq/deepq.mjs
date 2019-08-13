
import Neataptic from 'neataptic';

export function Network(...args) {
  let network = new Neataptic.architect.Perceptron(...args);

  for (let node of network.nodes) {
    if (node.type == 'output') {
      node.squash = Neataptic.methods.activation.IDENTITY;
    }
  }

  return enhance(network);
}

Network.from = function(object) {
  let network = Neataptic.Network.fromJSON(object);
  return enhance(network);
};

function enhance(network) {
  network.clone = clone;
  network.serialize = serialize;
  return network;
}

function serialize() {
  return this.toJSON();
}

function clone() {
  return Network.from(this.serialize());
}


export function ReplayMemory(capacity) {
  this.experiences = new Array(capacity);
  this.size = 0;
}

ReplayMemory.prototype.save = function(experience) {
  let capacity = this.experiences.length;
  let size = this.size;

  this.experiences[size % capacity] = experience;

  return ++this.size;
};

ReplayMemory.prototype.sample = function(batch) {
  let capacity = this.experiences.length;
  let size = this.size;

  if (size >= batch) {
    var batch = new Array(batch);
    let length = Math.min(size, capacity);

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
  let decay = Math.exp(-1 * this.steps * this.decay);

  let explore = this.end + (this.start - this.end) * decay;

  this.steps = steps + 1;

  return explore > value;
};

