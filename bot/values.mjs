
import { Contract } from '../contract.mjs';
import { Deck } from '../deck.mjs';
import { Card, Suit, Rank } from '../card.mjs';

const order = Contract.normal.acorn.order;
const deck = new Deck();

for (let suit of Suit) {
  for (let rank of Rank) {
    deck.add(Card[suit][rank]);
  }
}

export function stateOf(card) {
  return order.orderOf(card) / 32;
}

export function indexOf(card) {
  return order.orderOf(card) - 1;
}

export function cardOf(index) {
  return deck.cards[index];
}

