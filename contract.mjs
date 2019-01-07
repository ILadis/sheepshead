
import { Suits, Ranks } from './card.mjs';
import { Order } from './order.mjs';

export function Contract(value, order) {
  this.value = value;
  this.order = order;
}

Contract.prototype.assign = function(owner, partner = null) {
  this.owner = owner;
  this.partner = partner;
};

Contract.normal = function() {
  let order = new Order();
  order.promote([Suits.Heart], [Ranks.Sergeant, Ranks.Officer]);

  return new Contract(1, order);
};

Contract.geier = function(suit) {
  let order = new Order();
  order.promote(suit ? [suit] : [], [Ranks.Officer]);

  return new Contract(2, order);
};

Contract.wenz = function(suit) {
  let order = new Order();
  order.promote(suit ? [suit] : [], [Ranks.Sergeant]);

  return new Contract(3, order);
};

Contract.solo = function(suit) {
  let order = new Order();
  order.promote([suit], [Ranks.Sergeant, Ranks.Officer]);

  return new Contract(4, order);
};

