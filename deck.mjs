
import { Card, Suit, Rank } from './card.mjs';

export function Deck() {
  this.cards = new Array();
}

Deck.prototype.fill = function() {
  for (let suit of Suit) {
    for (let rank of Rank) {
      let card = Card[suit][rank];
      this.cards.push(card);
    }
  }
};

Deck.prototype.shuffle = function(rand = Math.random) {
  let index = this.cards.length;
  while (index != 0) {
    let shuffle = Math.floor(rand() * index--);
    let card = this.cards[index];

    this.cards[index] = this.cards[shuffle];
    this.cards[shuffle] = card;
  }
};

Deck.prototype.add = function(...cards) {
  for (let card of cards) {
    this.cards.push(card);
  }
};

Deck.prototype.draw = function(count = 4) {
  return this.cards.splice(0, count);
};

Deck.prototype.remove = function(...cards) {
  for (let card of cards) {
    let index = this.cards.indexOf(card);
    if (index != -1) {
      this.cards.splice(index, 1);
    }
  }
};

Deck.prototype.contains = function(card) {
  return this.cards.includes(card);
};

Deck.prototype.empty = function() {
  return this.cards.length <= 0;
};

Deck.prototype.clear = function() {
  while (this.cards.length) {
    this.cards.pop();
  }
};

Deck.prototype[Symbol.iterator] = function() {
  return this.cards.values();
};

