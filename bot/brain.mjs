
import { Tensor } from './tensor.mjs';
import * as Values from './values.mjs';

import Neataptic from 'neataptic';

export function Brain() {
  this.environment = new Tensor();
  this.occurrences = new Set();
  this.actions = new Map();
  this.network = new Neataptic.architect.Perceptron(77, 25, 15, 32);
};

Brain.prototype.ondealt = function(game, players) {
  for (let player of players) {
    if (!this.actions.has(player)) {
      this.actions.set(player, new Set());
    }
  }
};

Brain.prototype.onturn = function(game, player) {
  let tensor = new Tensor();
  let { trick, contract } = game;

  // add player hand cards
  var states = tensor.append(8);
  for (let card of player.cards) {
    states.next(Values.stateOf(card));
  }
  states.sort((s1, s2) => s2 - s1);
  states.commit();

  // add current trick cards
  var states = tensor.append(4);
  if (trick) {
    for (let card of trick.cards()) {
      states.next(Values.stateOf(card));
    }
  }
  states.commit();

  // add current card order
  var states = tensor.append(32);
  if (contract) {
    for (let card of contract.order.dominants) {
      states.next(Values.stateOf(card));
    }
    for (let card of contract.order.trumps) {
      states.next(Values.stateOf(card));
    }
  }
  states.commit();

  // add known cards
  var states = tensor.append(32);
  for (let card of this.occurrences) {
    let index = Values.indexOf(card)
    states[index] = 1;
  }
  states.commit();

  // add declarer/defender state
  var states = tensor.append(1);
  if (contract) {
    if (contract.owner == player) {
      states.next(1);
    } else if (contract.partner == player) {
      states.next(1);
    } else if (player.cards.contains(contract.partner)) {
      states.next(1);
    }
  }
  states.commit();

  this.environment = tensor;
};

Brain.prototype.onbid = function(game, player, rules) {
  return undefined;
};

Brain.prototype.onplay = function(game, player, rules) {
  let input = this.environment.states;
  let output = this.network.activate(input);

  do {
    let highest = 0, index = 0;
    for (let i = 0; i < output.length; i++) {
      let value = output[i];
      if (value > highest) {
        highest = value;
        index = i;
      }
    }

    output[index] = 0;

    var card = Values.cardOf(index);
  } while (!rules.valid(card));

  return card;
};

Brain.prototype.onplayed = function(game, player, card) {
  this.occurrences.add(card);

  let tensor = new Tensor();

  let states = tensor.append(32);
  let index = Values.indexOf(card);
  states[index] = 1;
  states.commit();

  let input = this.environment.states;
  let output = tensor.states;

  this.actions.get(player).add({ input, output });
};
var i = 0;
Brain.prototype.onfinished = function(game, winner, loser) {
  for (let player of winner.players) {
    if (winner.points > 90) {
      for (let action of this.actions.get(player)) {
        this.network.activate(action.input, true);
        this.network.propagate(0.3, 0.1, true, action.output);
      }
    }

    this.actions.get(player).clear();
  }

  this.occurrences.clear();
  for (let player of loser.players) {
    this.actions.get(player).clear();
  }
};

