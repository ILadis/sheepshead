
import Assert from 'assert';
import { Order } from './order.mjs';
import { Card, Suit, Rank } from './card.mjs';

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
      order.promote([], [Rank.sergeant, Rank.officer]);
      order.dominate(Suit.leaf);
      let dominants = Array.from(order.dominants);
      Assert.deepEqual(dominants, [
        Card[Suit.leaf][Rank.seven],
        Card[Suit.leaf][Rank.eight],
        Card[Suit.leaf][Rank.nine],
        Card[Suit.leaf][Rank.king],
        Card[Suit.leaf][Rank.ten],
        Card[Suit.leaf][Rank.ace]
      ]);
    });
  });

  describe('#promote()', () => {
    it('should make given suit trump card', () => {
      let order = new Order();
      order.promote([Suit.heart], []);
      let trumps = Array.from(order.trumps);
      Assert.deepEqual(trumps, [
        Card[Suit.heart][Rank.seven],
        Card[Suit.heart][Rank.eight],
        Card[Suit.heart][Rank.nine],
        Card[Suit.heart][Rank.sergeant],
        Card[Suit.heart][Rank.officer],
        Card[Suit.heart][Rank.king],
        Card[Suit.heart][Rank.ten],
        Card[Suit.heart][Rank.ace]
      ]);
    });

    it('should make given rank trump card', () => {
      let order = new Order();
      order.promote([], [Rank.sergeant, Rank.officer]);
      let trumps = Array.from(order.trumps);
      Assert.deepEqual(trumps, [
        Card[Suit.bell][Rank.sergeant],
        Card[Suit.heart][Rank.sergeant],
        Card[Suit.leaf][Rank.sergeant],
        Card[Suit.acorn][Rank.sergeant],
        Card[Suit.bell][Rank.officer],
        Card[Suit.heart][Rank.officer],
        Card[Suit.leaf][Rank.officer],
        Card[Suit.acorn][Rank.officer]
      ]);
    });

    it('should make given suit/rank trump card', () => {
      let order = new Order();
      order.promote([Suit.heart], [Rank.sergeant]);
      let trumps = Array.from(order.trumps);
      Assert.deepEqual(trumps, [
        Card[Suit.heart][Rank.seven],
        Card[Suit.heart][Rank.eight],
        Card[Suit.heart][Rank.nine],
        Card[Suit.heart][Rank.officer],
        Card[Suit.heart][Rank.king],
        Card[Suit.heart][Rank.ten],
        Card[Suit.heart][Rank.ace],
        Card[Suit.bell][Rank.sergeant],
        Card[Suit.heart][Rank.sergeant],
        Card[Suit.leaf][Rank.sergeant],
        Card[Suit.acorn][Rank.sergeant]
      ]);
    });
  });

  describe('#valueOf()', () => {
    describe('with heart/sergeant tump, leaf dominant', () => {
      let order = new Order();
      order.promote([Suit.heart], [Rank.sergeant]);
      order.dominate(Suit.leaf);

      it('should return 0 for acorn ace', () => {
        let card = Card[Suit.acorn][Rank.ace];
        Assert.equal(order.valueOf(card), 0);
      });

      it('should return 2 for dominant leaf eight', () => {
        let card = Card[Suit.leaf][Rank.eight];
        Assert.equal(order.valueOf(card), 2);
      });

      it('should return 4 for dominant leaf officer', () => {
        let card = Card[Suit.leaf][Rank.officer];
        Assert.equal(order.valueOf(card), 4);
      });

      it('should return 15 for trump bell sergeant', () => {
        let card = Card[Suit.bell][Rank.sergeant];
        Assert.equal(order.valueOf(card), 15);
      });
    });

    describe('with heart/sergeant/officer tump', () => {
      let order = new Order();
      order.promote([Suit.heart], [Rank.sergeant, Rank.officer]);

      it('should return 1 for trump heart seven', () => {
        let card = Card[Suit.heart][Rank.seven];
        Assert.equal(order.valueOf(card), 1);
      });

      it('should return 4 for trump heart king', () => {
        let card = Card[Suit.heart][Rank.king];
        Assert.equal(order.valueOf(card), 4);
      });

      it('should return 9 for trump leaf sergeant', () => {
        let card = Card[Suit.leaf][Rank.sergeant];
        Assert.equal(order.valueOf(card), 9);
      });

      it('should return 11 for trump bell officer', () => {
        let card = Card[Suit.bell][Rank.officer];
        Assert.equal(order.valueOf(card), 11);
      });
    });
  });
});

