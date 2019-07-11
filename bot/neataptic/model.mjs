
import { Card, Suit, Rank } from '../../card.mjs';
import { Tensor } from './tensor.mjs';

export function Builder() {
  this.tensor = new Tensor();
}

Builder.prototype.addCards = function(cards) {
  let states = this.tensor.append(Indices.cards.size());
  if (cards) {
    for (let card of cards) {
      let index = Indices.cards.indexOf(card);
      states[index] = 1;
    }
  }
  states.commit();
  return this;
};

Builder.prototype.addSuits = function(card) {
  let states = this.tensor.append(Indices.suits.size());
  if (card) {
    let suit = card.suit;
    let index = Indices.suits.indexOf(suit);
    states[index] = 1;
  }
  states.commit();
  return this;
};

Builder.prototype.addTrump = function(card, order) {
  let states = this.tensor.append(1);
  if (order.trumps.contains(card)) {
    states.next(1);
  }
  states.commit();
  return this;
};

Builder.prototype.addDeclarer = function(parties, actor) {
  let states = this.tensor.append(1);
  if (parties) {
    let declarer = parties.declarer;
    if (declarer.has(actor)) {
      states.next(1);
    }
  }
  states.commit();
  return this;
};

Builder.prototype.addWinner = function(parties, winner, actor) {
  let states = this.tensor.append(1);
  if (parties && winner) {
    let { declarer, defender } = parties;
    if (declarer.has(actor) && declarer.has(winner)) {
      states.next(1);
    }
    else if (defender.has(actor) && defender.has(winner)) {
      states.next(1);
    }
  }
  states.commit();
  return this;
};

export function Indices(define) {
  define(this.values = new Map());
}

Indices.prototype.indexOf = function(value) {
  return this.values.get(value);
};

Indices.prototype.valueOf = function(index) {
  return this.values.get(index);
};

Indices.prototype.size = function() {
  return this.values.size / 2;
};

Indices.cards = new Indices((values) => {
  for (let suit of Suit) {
    for (let rank of Rank) {
        var index = ++index || 0;
        var card = Card[suit][rank];

        values.set(index, card);
        values.set(card, index);
    }
  }
});

Indices.suits = new Indices((values) => {
  for (let suit of Suit) {
    var index = ++index || 0

    values.set(index, suit);
    values.set(suit, index);
  }
});

