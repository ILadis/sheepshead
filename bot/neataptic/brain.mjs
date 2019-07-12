
import { Contract } from '../../contract.mjs';
import { Tensor, Builder, Indices, Inspector } from './utils.mjs';

import Neataptic from 'neataptic';

export function Brain() {
  this.network = new Neataptic.architect.Perceptron(103, 60, 32);
}

Brain.prototype.onbid = function(game, actor, rules) {
  if (actor.brain == this) {
    let contracts = Array.from(Contract).filter(c => c.value == 1);
    let options = Array.from(rules.options(contracts));

    let index = Math.floor(Math.random() * options.length);
    let contract = options[index];

    return contract;
  }
};

Brain.prototype.onplay = function(game, actor, rules) {
  if (actor.brain == this) {
    let input = this.observe(game);
    let output = this.network.activate(input);

    do {
      var highest = 0, index = 0;
      for (let i = 0; i < output.length; i++) {
        let value = output[i];
        if (value > highest) {
          highest = value;
          index = i;
        }
      }

      output[index] = 0;

      var card = Indices.cards.valueOf(index);
    } while (!rules.valid(card));

    this.remember(input, output, index);

    return card;
  }
};

Brain.prototype.observe = function(game) {
  let { actor, trick, contract } = game;

  let order = contract.order;
  let lead = trick.lead();
  let winner = trick.winner(order);

  let inspect = new Inspector(game);

  let cards = inspect.playedCards();
  let parties = inspect.currentParties();

  let tensor = new Tensor();
  let builder = new Builder(tensor);

  builder.cards(actor.cards)
    .cards(cards)
    .cards(trick.cards())
    .trumpFlag(lead, order)
    .suits(lead)
    .declarerFlag(parties, actor)
    .winnerFlag(parties, winner, actor);

  return tensor.states;
};

Brain.prototype.remember = function(input, output, index) {
  output.fill(0);
  output[index] = 1;

  this.network.activate(input, true);
  this.network.propagate(0.03, 0, true, output);
};

Brain.prototype.clone = function() {
  let json = this.network.toJSON();
  let network = Neataptic.Network.fromJSON(json);

  let brain = new Brain();
  brain.network = network;

  return brain;
};

Brain.prototype.serialize = function() {
  let json = this.network.toJSON();
  return json;
};

Brain.prototype.deserialize = function(json) {
  let network = Neataptic.Network.fromJSON(json);
  this.network = network;
};

