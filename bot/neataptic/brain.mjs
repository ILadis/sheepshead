
import { Card, Suit, Rank } from '../../card.mjs';
import { Tensor } from './tensor.mjs';
import * as Values from './values.mjs';

import Neataptic from 'neataptic';

export function Brain() {
  this.actions = new Map();
  this.network = new Neataptic.architect.Perceptron(102, 60, 32);
};

Brain.prototype.ondealt = function(game, players) {
  this.actions.clear();

  for (let player of players) {
    this.actions.set(player, new Set());
  }
};

Brain.prototype.onbid = function() {
  return undefined;
};

Brain.prototype.onplay = function(game, actor, rules) {
  let { trick, contract, players } = game;

  let input = new Tensor();

  // add player hand cards
  var states = input.append(32);
  for (let card of actor.cards) {
    let index = Values.indexOf(card);
    states[index] = 1;
  }
  states.commit();

  // add current trick cards
  var states = input.append(32);
  for (let card of trick.cards()) {
    let index = Values.indexOf(card);
    states[index] = 1;
  }
  states.commit();

  // add dominant suit
  let lead = trick.lead();

  var states = input.append(4);
  if (lead) {
    if (contract.order.trumps.contains(lead)) {
      states[0] = 1;
    } else switch (lead.suit) {
      case Suit.bell:
        states[1] = 1;
        break;
      case Suit.leaf:
        states[2] = 1;
        break;
      case Suit.acorn:
        states[3] = 1;
        break;
    }
  }
  states.commit();

  // add known cards
  let cards = determinePlayedCards(players);

  var states = input.append(32);
  for (let card of cards) {
    let index = Values.indexOf(card);
    states[index] = 1;
  }
  states.commit();

  // add declarer/defender state
  let parties = determineParties(contract, players, actor);
  let { declarer, defender } = parties;
  
  var states = input.append(1);
  if (declarer.has(actor)) {
    states.next(1);
  }
  states.commit();

  // add current trick winner
  let winner = trick.winner(contract.order);
  
  var states = input.append(1);
  if (declarer.has(actor) && declarer.has(winner)) {
    states.next(1);
  }
  else if (defender.has(actor) && defender.has(winner)) {
    states.next(1);
  }
  states.commit();

  var output = this.network.activate(input.states);

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

  var output = new Tensor();

  var states = output.append(32);
  if (card) {
    let index = Values.indexOf(card);
    states[index] = 1;
  }
  states.commit();

  this.actions.get(actor).add({ input, output });

  return card;
};

Brain.prototype.onfinished = function(game, winner) {
  for (let player of winner.players) {
    for (let action of this.actions.get(player)) {
      this.network.activate(action.input.states, true);
      this.network.propagate(0.3, 0.1, true, action.output.states);
    }
  }
};

function determineParties(contract, players, actor) {
  let declarer = new Set();
  let defender = new Set();

  if (contract) {
    for (let player of players) {
      switch (player) {
      case contract.owner:
      case contract.partner:
        declarer.add(player);
        break;
      default:
        defender.add(player);
      }
    }

    if (actor.cards.contains(contract.partner)) {
      declarer.add(actor);
      defender.delete(actor);
    }
  }

  return { declarer, defender };
}

function determinePlayedCards(players) {
  let cards = new Set();
  for (let suit of Suit) {
    for (let rank of Rank) {
      cards.add(Card[suit][rank]);
    }
  }

  for (let player of players) {
    for (let card of player.cards) {
      cards.delete(card);
    }
  }

  return cards;
}

