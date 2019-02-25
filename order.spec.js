
import Assert from 'assert';
import { Order } from './order.mjs';
import { Card, Suits, Ranks } from './card.mjs';

describe('Order', () => {
  it('should have iterable trumps property', () => {
    let order = new Order();
    Assert.ok(order.trumps[Symbol.iterator]);
  });

  it('should have has function for trumps property', () => {
    let order = new Order();
    Assert.equal(typeof order.trumps.has, 'function');
  });

  it('should have iterable dominants property', () => {
    let order = new Order();
    Assert.ok(order.dominants[Symbol.iterator]);
  });

  it('should have has function for dominants property', () => {
    let order = new Order();
    Assert.equal(typeof order.dominants.has, 'function');
  });

  describe('#dominate()', () => {
    it('should make non trumps of given suit dominants', () => {
      let order = new Order();
      order.promote([], [Ranks.Sergeant, Ranks.Officer]);
      order.dominate(Suits.Leaf);
      let dominants = Array.from(order.dominants);
      Assert.deepEqual(dominants, [
        Card[Suits.Leaf][Ranks.Seven],
        Card[Suits.Leaf][Ranks.Eight],
        Card[Suits.Leaf][Ranks.Nine],
        Card[Suits.Leaf][Ranks.King],
        Card[Suits.Leaf][Ranks.Ten],
        Card[Suits.Leaf][Ranks.Ace]
      ]);
    });
  });

  describe('#promote()', () => {
    it('should make given suit trump cards', () => {
      let order = new Order();
      order.promote([Suits.Heart], []);
      let trumps = Array.from(order.trumps);
      Assert.deepEqual(trumps, [
        Card[Suits.Heart][Ranks.Seven],
        Card[Suits.Heart][Ranks.Eight],
        Card[Suits.Heart][Ranks.Nine],
        Card[Suits.Heart][Ranks.Sergeant],
        Card[Suits.Heart][Ranks.Officer],
        Card[Suits.Heart][Ranks.King],
        Card[Suits.Heart][Ranks.Ten],
        Card[Suits.Heart][Ranks.Ace]
      ]);
    });

    it('should make given ranks trump cards', () => {
      let order = new Order();
      order.promote([], [Ranks.Sergeant, Ranks.Officer]);
      let trumps = Array.from(order.trumps);
      Assert.deepEqual(trumps, [
        Card[Suits.Bell][Ranks.Sergeant],
        Card[Suits.Heart][Ranks.Sergeant],
        Card[Suits.Leaf][Ranks.Sergeant],
        Card[Suits.Acorn][Ranks.Sergeant],
        Card[Suits.Bell][Ranks.Officer],
        Card[Suits.Heart][Ranks.Officer],
        Card[Suits.Leaf][Ranks.Officer],
        Card[Suits.Acorn][Ranks.Officer]
      ]);
    });

    it('should make given suits/ranks trump cards', () => {
      let order = new Order();
      order.promote([Suits.Heart], [Ranks.Sergeant]);
      let trumps = Array.from(order.trumps);
      Assert.deepEqual(trumps, [
        Card[Suits.Heart][Ranks.Seven],
        Card[Suits.Heart][Ranks.Eight],
        Card[Suits.Heart][Ranks.Nine],
        Card[Suits.Heart][Ranks.Officer],
        Card[Suits.Heart][Ranks.King],
        Card[Suits.Heart][Ranks.Ten],
        Card[Suits.Heart][Ranks.Ace],
        Card[Suits.Bell][Ranks.Sergeant],
        Card[Suits.Heart][Ranks.Sergeant],
        Card[Suits.Leaf][Ranks.Sergeant],
        Card[Suits.Acorn][Ranks.Sergeant]
      ]);
    });
  });

  describe('#valueOf()', () => {
    describe('with heart/sergeant tump, leaf dominant', () => {
      let order = new Order();
      order.promote([Suits.Heart], [Ranks.Sergeant]);
      order.dominate(Suits.Leaf);

      it('should return 0 for acorn ace', () => {
        let card = Card[Suits.Acorn][Ranks.Ace];
        Assert.equal(order.valueOf(card), 0);
      });

      it('should return 2 for dominant leaf eight', () => {
        let card = Card[Suits.Leaf][Ranks.Eight];
        Assert.equal(order.valueOf(card), 2);
      });

      it('should return 4 for dominant leaf officer', () => {
        let card = Card[Suits.Leaf][Ranks.Officer];
        Assert.equal(order.valueOf(card), 4);
      });

      it('should return 15 for trump bell sergeant', () => {
        let card = Card[Suits.Bell][Ranks.Sergeant];
        Assert.equal(order.valueOf(card), 15);
      });
    });

    describe('with heart/sergeant/officer tump', () => {
      let order = new Order();
      order.promote([Suits.Heart], [Ranks.Sergeant, Ranks.Officer]);

      it('should return 1 for trump heart seven', () => {
        let card = Card[Suits.Heart][Ranks.Seven];
        Assert.equal(order.valueOf(card), 1);
      });

      it('should return 4 for trump heart king', () => {
        let card = Card[Suits.Heart][Ranks.King];
        Assert.equal(order.valueOf(card), 4);
      });

      it('should return 9 for trump leaf sergeant', () => {
        let card = Card[Suits.Leaf][Ranks.Sergeant];
        Assert.equal(order.valueOf(card), 9);
      });

      it('should return 11 for trump bell officer', () => {
        let card = Card[Suits.Bell][Ranks.Officer];
        Assert.equal(order.valueOf(card), 11);
      });
    });
  });
});

