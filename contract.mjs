
import { Card, Suit, Rank } from './card.mjs';
import { Order } from './order.mjs';

export function Contract(factory) {
  this.order = new Order();
  this.partner = null;
  factory.call(this);
}

Contract.prototype.assign = function(owner) {
  this.owner = owner;
};

Contract.normal = {
  get bell() {
    return new Contract(function() {
      this.value = 1;
      this.name = 'normal';
      this.variant = 'bell';
      this.partner = Card[Suit.bell][Rank.ace];
      this.order.promote([Suit.heart], [Rank.sergeant, Rank.officer]);
    });
  },
  get leaf() {
    return new Contract(function() {
      this.value = 1;
      this.name = 'normal';
      this.variant = 'leaf';
      this.partner = Card[Suit.leaf][Rank.ace];
      this.order.promote([Suit.heart], [Rank.sergeant, Rank.officer]);
    });
  },
  get acorn() {
    return new Contract(function() {
      this.value = 1;
      this.name = 'normal';
      this.variant = 'acorn';
      this.partner = Card[Suit.acorn][Rank.ace];
      this.order.promote([Suit.heart], [Rank.sergeant, Rank.officer]);
    });
  }
};

Contract.geier = {
  get default() {
    return new Contract(function() {
      this.value = 2;
      this.name = 'geier';
      this.variant = 'default';
      this.order.promote([], [Rank.officer]);
    });
  }
};

Contract.wenz = {
  get default() {
    return new Contract(function() {
      this.value = 3;
      this.name = 'wenz';
      this.variant = 'default';
      this.order.promote([], [Rank.sergeant]);
    });
  }
};

Contract.solo = {
  get bell() {
    return new Contract(function() {
      this.value = 4;
      this.name = 'solo';
      this.variant = 'bell';
      this.order.promote([Suit.bell], [Rank.sergeant, Rank.officer]);
    });
  },
  get heart() {
    return new Contract(function() {
      this.value = 4;
      this.name = 'solo';
      this.variant = 'heart';
      this.order.promote([Suit.heart], [Rank.sergeant, Rank.officer]);
    });
  },
  get leaf() {
    return new Contract(function() {
      this.value = 4;
      this.name = 'solo';
      this.variant = 'leaf';
      this.order.promote([Suit.leaf], [Rank.sergeant, Rank.officer]);
    });
  },
  get acorn() {
    return new Contract(function() {
      this.value = 4;
      this.name = 'solo';
      this.variant = 'acorn';
      this.order.promote([Suit.acorn], [Rank.sergeant, Rank.officer]);
    });
  }
};

