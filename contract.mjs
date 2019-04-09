
import { Card, Suit, Rank } from './card.mjs';
import { Order } from './order.mjs';

export function Contract(value, order, partner = null) {
  this.value = value;
  this.order = order;
  this.partner = partner;
}

Contract.prototype.assign = function(owner) {
  this.owner = owner;
};

Contract.normal = {
  get bell() {
    let order = new Order();
    order.promote([Suit.heart], [Rank.sergeant, Rank.officer]);
    let partner = Card[Suit.bell][Rank.ace];
    return new Contract(1, order, partner);
  },
  get leaf() {
    let order = new Order();
    order.promote([Suit.heart], [Rank.sergeant, Rank.officer]);
    let partner = Card[Suit.leaf][Rank.ace];
    return new Contract(1, order, partner);
  },
  get acorn() {
    let order = new Order();
    order.promote([Suit.heart], [Rank.sergeant, Rank.officer]);
    let partner = Card[Suit.acorn][Rank.ace];
    return new Contract(1, order, partner);
  }
};

Contract.geier = {
  get default() {
    let order = new Order();
    order.promote([], [Rank.officer]);
    return new Contract(2, order);
  }
};

Contract.wenz = {
  get default() {
    let order = new Order();
    order.promote([], [Rank.sergeant]);
    return new Contract(3, order);
  }
};

Contract.solo = {
  get bell() {
    let order = new Order();
    order.promote([Suit.bell], [Rank.sergeant, Rank.officer]);
    return new Contract(4, order);
  },
  get heart() {
    let order = new Order();
    order.promote([Suit.heart], [Rank.sergeant, Rank.officer]);
    return new Contract(4, order);
  },
  get leaf() {
    let order = new Order();
    order.promote([Suit.leaf], [Rank.sergeant, Rank.officer]);
    return new Contract(4, order);
  },
  get acorn() {
    let order = new Order();
    order.promote([Suit.acorn], [Rank.sergeant, Rank.officer]);
    return new Contract(4, order);
  }
};

