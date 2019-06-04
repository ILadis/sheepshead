
import { Deck } from './deck.mjs';
import { Card, Rank, Suit } from './card.mjs';

export function Order() {
  this.trumps = new Deck();
  this.dominants = new Deck();
}

Order.prototype.dominate = function(suit) {
  this.dominants.clear();
  if (suit) {
    for (let rank of Rank) {
      let card = Card[suit][rank];
      if (!this.trumps.contains(card)) {
        this.dominants.add(card);
      }
    }
  }
};

Order.prototype.promote = function(suits = [], ranks = []) {
  this.trumps.clear();
  for (let suit of suits) {
    for (let rank of Rank) {
      if (!ranks.includes(rank)) {
        let card = Card[suit][rank];
        this.trumps.add(card);
      }
    }
  }

  for (let rank of ranks) {
    for (let suit of Suit) {
      let card = Card[suit][rank];
      this.trumps.add(card);
    }
  }
};

Order.prototype.valueOf = function(card) {
  let value = 1;

  for (let dominant of this.dominants) {
    if (dominant == card) {
      return value;
    }
    value++;
  }

  for (let trump of this.trumps) {
    if (trump == card) {
      return value;
    }
    value++;
  }

  return 0;
};

Order.prototype.orderOf = function(card) {
  let value = 1;

  for (let suit of Suit) {
    for (let rank of Rank) {
      let c = Card[suit][rank];
      if (card == c && !this.trumps.contains(c)) {
        return value;
      }
      value++
    }
  }

  for (let trump of this.trumps) {
    if (trump == card) {
      return value;
    }
    value++;
  }

  return 0;
};

