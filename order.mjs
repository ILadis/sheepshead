
import { Card, Ranks, Suits } from './card.mjs';

export function Order() {
  this.trumps = new Set();
  this.dominants = new Set();
}

Order.prototype.dominate = function(suit) {
  this.dominants.clear();
  for (let rank of Ranks) {
    let card = Card[suit][rank];
    if (!this.trumps.has(card)) {
      this.dominants.add(card);
    }
  }
};

Order.prototype.promote = function(suits = [], ranks = []) {
  this.trumps.clear();
  for (let suit of suits) {
    for (let rank of Ranks) {
      if (!ranks.includes(rank)) {
        let card = Card[suit][rank];
        this.trumps.add(card);
      }
    }
  }

  for (let rank of ranks) {
    for (let suit of Suits) {
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

  for (let suit of Suits) {
    for (let rank of Ranks) {
      let c = Card[suit][rank];
      if (card == c && !this.trumps.has(c)) {
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


