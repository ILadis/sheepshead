
import * as Phases from '../../phases.mjs';
import { Card, Suit, Rank } from '../../card.mjs';
import { Tensor, Builder, Indices } from './model.mjs';

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

Brain.prototype.onturn = function(game, actor) {
  let { phase, trick, contract, players } = game;

  if (phase == Phases.playing) {
    let order = contract.order;
    let lead = trick.lead();
    let winner = trick.winner(order);

    let cards = determinePlayedCards(players);
    let parties = determineParties(contract, players, actor);

    var tensor = new Tensor();
    let builder = new Builder(tensor)
      .addCards(actor.cards)
      .addCards(cards)
      .addCards(trick.cards())
      .addTrump(lead, order)
      .addSuits(lead)
      .addDeclarer(parties, actor)
      .addWinner(parties, winner, actor);
  }

  this.input = tensor;
};

Brain.prototype.onplayed = function(game, actor, card) {
  let input = this.input;
  let output = new Tensor();

  let states = output.append(Indices.cards.size());
  let index = Indices.cards.indexOf(card);
  states[index] = 1;

  states.commit();

  this.actions.get(actor).add({ input, output });
};

Brain.prototype.onbid = function() {
  return undefined;
};

Brain.prototype.onplay = function(game, actor, rules) {
  if (actor.brain == this) {
    let input = this.input;
    let output = this.network.activate(input.states);

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
  }
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

