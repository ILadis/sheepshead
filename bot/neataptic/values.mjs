
import { Card, Suit, Rank } from '../../card.mjs';

const values = new Map();
for (let suit of Suit) {
  for (let rank of Rank) {
    var index = ++index || 0;
    var card = Card[suit][rank];

    values.set(index, card);
    values.set(card, index);
  }
}

export function indexOf(card) {
  return values.get(card);
};

export function cardOf(index) {
  return values.get(index);
};

