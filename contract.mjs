
import { Card, Suit, Rank } from './card.mjs';
import { Order } from './order.mjs';

export function Contract(value) {
  this.value = value;
}

Contract.prototype.dictate = function(order, suit = null) {
  this.order = order;
  this.suit = suit;
};

Contract.prototype.assign = function(owner, partner = null) {
  this.owner = owner;
  this.partner = partner;
};

Contract.normal = function(player, suit) {
  let partner = Card[suit][Rank.ace];

  let order = new Order();
  order.promote([Suit.heart], [Rank.sergeant, Rank.officer]);

  let contract = new Contract(1);
  contract.dictate(order, suit);
  contract.assign(player, partner);

  return contract;
};

Contract.geier = function(player) {
  let order = new Order();
  order.promote([], [Rank.officer]);

  let contract = new Contract(2);
  contract.dictate(order);
  contract.assign(player);

  return contract;
};

Contract.wenz = function(player) {
  let order = new Order();
  order.promote([], [Rank.sergeant]);

  let contract = new Contract(3);
  contract.dictate(order);
  contract.assign(player);

  return contract;
};

Contract.solo = function(player, suit) {
  let order = new Order();
  order.promote([suit], [Rank.sergeant, Rank.officer]);

  let contract = new Contract(4);
  contract.dictate(order, suit);
  contract.assign(player);

  return contract;
};

Contract[Symbol.iterator] = function*() {
  for (let label in Contract) {
    let factory = Contract[label];
    yield [label, factory];
  }
};

