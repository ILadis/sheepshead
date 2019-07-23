
import Neataptic from 'neataptic';

export function DeepQ(...args) {
  let network = new Neataptic.architect.Perceptron(...args);

  for (let node of network.nodes) {
    if (node.type == 'output') {
      node.squash = Neataptic.methods.activation.IDENTITY;
    }
  }

  return enhance(network);
}

DeepQ.from = function(object) {
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
  return DeepQ.from(this.serialize());
}

