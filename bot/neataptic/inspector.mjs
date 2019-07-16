
import { Card, Suit, Rank } from '../../card.mjs';

export function Inspector(game) {
  this.game = game;
}

Inspector.prototype.currentParties = function(actor) {
  let { contract, players } = this.game;

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
    else {
      if (declarer.has(actor) && !declarer.has(contract.partner)) {
        defender.clear();
      }

      if (defender.has(actor) && !declarer.has(contract.partner)) {
        defender.clear();
        defender.add(actor);
      }
    }
  }

  return { declarer, defender };
};

Inspector.prototype.playedCards = function() {
  let { players } = this.game;

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
};

