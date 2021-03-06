
import { Card, Suit, Rank } from '../../card.mjs';

export function Tensor() {
  this.states = new Array();
}

Tensor.prototype.append = function(slots) {
  let states = new Array(slots);
  states.fill(0);

  let index = 0;
  states.next = (value) => {
    states[index++] = value;
  };

  states.commit = () => {
    for (let value of states) {
      this.states.push(value);
    }
  };

  return states;
};

export function Builder(tensor) {
  this.tensor = tensor;
}

Builder.prototype.cards = function(cards) {
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

Builder.prototype.suits = function(card) {
  let states = this.tensor.append(Indices.suits.size());
  if (card) {
    let suit = card.suit;
    let index = Indices.suits.indexOf(suit);
    states[index] = 1;
  }
  states.commit();
  return this;
};

Builder.prototype.flag = function(flag) {
  let states = this.tensor.append(1);
  if (flag) {
    states.next(1);
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

