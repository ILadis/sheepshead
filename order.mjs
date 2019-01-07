
import { Card, Ranks, Suits } from './card.mjs';

export function Order() {
  this.trumps = new Set();
}

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
}

Order.prototype.valueOf = function(card) {
  let value = 1;

  if (this.dominant) {
    for (let rank of Ranks) {
      let c = Card[this.dominant][rank];
      if (!this.trumps.has(c) && card == c) {
        return value;
      }
      value++;
    }
  }

  for (let c of this.trumps) {
    if (card == c) {
      return value;
    }
    value++;
  }

  return 0;
};

