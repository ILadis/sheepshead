
import { Inspector } from './inspector.mjs';
import { Tensor, Builder, Indices } from './model.mjs';

import Neataptic from 'neataptic';

export function Brain() {
  this.network = new Neataptic.architect.Perceptron(102, 60, 32);
  this.actions = new Set();
}

Brain.prototype.onbid = function() {
  return undefined;
};

Brain.prototype.onplay = function(game, actor, rules) {
  if (actor.brain == this) {
    let input = this.observe(game);
    let output = this.network.activate(input);

    do {
      var index = this.sample(output);
      var card = Indices.cards.valueOf(index);
    } while (!rules.valid(card));

    output.fill(0);
    output[index] = 1;

    this.action = { input, output };
    this.actions.add({ input, output });

    return card;
  }
};

Brain.prototype.oncompleted = function(game, trick) {
  let inspect = new Inspector(game);

  for (let player of game.players) {
    if (player.brain == this) {
      let parties = inspect.currentParties(player);
      let winner = inspect.victoriousParty(parties);

      let reward = trick.points() || 1;

      if (winner && winner.has(player)) {
        this.remember(this.action, reward);
      }
    }
  }
};

Brain.prototype.onfinished = function(game, winner) {
  for (let player of winner.players) {
    if (player.brain == this) {
      let reward = winner.points();

      for (let action of this.actions) {
        this.remember(action, reward);
      }
    }
  }

  this.actions.clear();
};

Brain.prototype.sample = function(output) {
  let distribution = output.reduce((v1, v2) => v1 + v2);
  let sample = Math.random() * distribution;

  for (let i = 0; i < output.length; i++) {
    sample -= output[i];
    if (sample < 0) {
      output[i] = 0;
      return i;
    }
  }
};

Brain.prototype.observe = function(game) {
  let { actor, trick, contract } = game;

  let order = contract.order;
  let lead = trick.lead();
  let winner = trick.winner(order);

  let inspect = new Inspector(game);

  let cards = inspect.playedCards();
  let parties = inspect.currentParties(actor);

  let tensor = new Tensor();
  let builder = new Builder(tensor);

  builder.cards(actor.cards)
    .cards(cards)
    .cards(trick.cards())
    .suits(lead)
    .trumpFlag(lead, order)
    .winnerFlag(parties, winner, actor);

  return tensor.states;
};

Brain.prototype.remember = function(action, reward) {
  let { input, output } = action;

  let rate = 0.0001 * reward;
  let momentum = 0;

  this.network.activate(input, true);
  this.network.propagate(rate, momentum, true, output);
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

