
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

Contract.normal = function(player, partner) {
  let order = new Order();
  order.promote([Suits.Heart], [Ranks.Sergeant, Ranks.Officer]);

  let contract = new Contract(1, order);
  contract.assign(player, partner);

  return contract;
};

Contract.geier = function(player, suit) {
  let order = new Order();
  order.promote(suit ? [suit] : [], [Ranks.Officer]);

  let contract = new Contract(2, order);
  contract.assign(player);

  return contract;
};

Contract.wenz = function(player, suit) {
  let order = new Order();
  order.promote(suit ? [suit] : [], [Ranks.Sergeant]);

  let contract = new Contract(3, order);
  contract.assign(player);

  return contract;
};

Contract.solo = function(player, suit) {
  let order = new Order();
  order.promote([suit], [Ranks.Sergeant, Ranks.Officer]);

  let contract = new Contract(4, order);
  contract.assign(player);

  return contract;
};

