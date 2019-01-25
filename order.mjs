
import { Card, Ranks, Suits } from './card.mjs';

export function Order() {
  this.trumps = new Map();
  this.dominants = new Map();
}

Order.prototype.dominate = function(suit) {
  let value = 1;

  this.dominants.clear();
  for (let rank of Ranks) {
    let card = Card[suit][rank];
    if (!this.trumps.has(card)) {
      this.dominants.set(card, value++);
    }
  }
};

Order.prototype.promote = function(suits = [], ranks = []) {
  let value = 1;

  this.trumps.clear();
  for (let suit of suits) {
    for (let rank of Ranks) {
      if (!ranks.includes(rank)) {
        let card = Card[suit][rank];
        this.trumps.set(card, value++);
      }
    }
  }

  for (let rank of ranks) {
    for (let suit of Suits) {
      let card = Card[suit][rank];
      this.trumps.set(card, value++);
    }
  }
};

Order.prototype.valueOf = function(card) {
  if (this.dominants.has(card)) {
    return this.dominants.get(card);
  }

  if (this.trumps.has(card)) {
    return this.dominants.size + this.trumps.get(card);
  }

  return 0;
};

