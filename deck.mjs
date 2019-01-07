
import { Card, Suits, Ranks } from './card.mjs';

export function Deck() {
  this.cards = new Array();
}

Deck.prototype.fill = function() {
  for (let suit of Suits) {
    for (let rank of Ranks) {
      let card = Card[suit][rank];
      this.cards.push(card);
    }
  }
};

Deck.prototype.shuffle = function() {
  let index = this.cards.length;
  while (index != 0) {
    let shuffle = Math.floor(Math.random() * index--);
    let card = this.cards[index];

    this.cards[index] = this.cards[shuffle];
    this.cards[shuffle] = card;
  }
};

Deck.prototype.draw = function(count = 4) {
  return this.cards.splice(0, count);
};

Deck.prototype.empty = function() {
  return this.cards.length <= 0;
};

