
import { Inspector } from './inspector.mjs';
import { Tensor, Builder, Indices } from './model.mjs';

import Neataptic from 'neataptic';

export function Brain() {
  this.network = new Neataptic.architect.Perceptron(102, 60, 32);
}

Brain.prototype.onbid = function() {
  return undefined;
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

    output.fill(0);
    output[index] = 1;

    this.action = { input, output };

    return card;
  }
};

Brain.prototype.oncompleted = function(game, trick) {
  let inspect = new Inspector(game);

  for (let player of game.players) {
    if (player.brain == this) {
      let parties = inspect.currentParties(player);
      let winner = inspect.victoriousParty(parties);

      if (winner && winner.has(player)) {
        this.remember(this.action, trick.points() || 1);
      }
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

