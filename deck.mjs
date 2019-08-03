
import { Card, Suit, Rank } from './card.mjs';

export function Deck() {
  this.cards = new Array();
}

Deck.prototype.fill = function() {
  this.clear();
  for (let suit of Suit) {
    for (let rank of Rank) {
      this.add(Card[suit][rank]);
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

Deck.prototype.sort = function(comparator) {
  this.cards.sort(comparator);
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

Deck.prototype.size = function() {
  return this.cards.length;
};

Deck.prototype.empty = function() {
  return this.cards.length <= 0;
};

Deck.prototype.clear = function() {
  while (this.cards.length) {
    this.cards.pop();
  }
};

Deck.prototype[Symbol.iterator] = function*() {
  let iterator = this.cards.values();
  for (let card of iterator) {
    yield card;
  }
};

