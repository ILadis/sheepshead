
import Assert from 'assert';
import { Deck } from '../deck.mjs';
import { Order } from '../order.mjs';
import { Card, Suit, Rank } from '../card.mjs';

describe('Order', () => {
  it('should have trumps property', () => {
    let order = new Order();
    Assert.ok(order.trumps instanceof Deck);
  });

  it('should have dominants property', () => {
    let order = new Order();
    Assert.ok(order.dominants instanceof Deck);
  });

  describe('#dominate()', () => {
    it('should make non trumps of given card dominants', () => {
      let order = new Order();
      order.promote([], [Rank.sergeant, Rank.officer]);
      order.dominate(Card[Suit.leaf][Rank.seven]);
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

    it('should not make dominants if given card is trump', () => {
      let order = new Order();
      order.promote([], [Rank.sergeant, Rank.officer]);
      order.dominate(Card[Suit.leaf][Rank.officer]);
      Assert.ok(order.dominants.empty());
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
    describe('with heart/sergeant trump, leaf dominant', () => {
      let order = new Order();
      order.promote([Suit.heart], [Rank.sergeant]);
      order.dominate(Card[Suit.leaf][Rank.seven]);

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

    describe('with heart/sergeant/officer trump', () => {
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

  describe('#orderOf()', () => {
    describe('with heart/sergeant/officer trump', () => {
      let order = new Order();
      order.promote([Suit.heart], [Rank.sergeant, Rank.officer]);

      it('should return 1 for bell seven', () => {
        let card = Card[Suit.bell][Rank.seven];
        Assert.equal(order.orderOf(card), 1);
      });

      it('should return 5 for bell ten', () => {
        let card = Card[Suit.bell][Rank.ten];
        Assert.equal(order.orderOf(card), 5);
      });

      it('should return 8 for leaf eight', () => {
        let card = Card[Suit.leaf][Rank.eight];
        Assert.equal(order.orderOf(card), 8);
      });

      it('should return 16 for acorn king', () => {
        let card = Card[Suit.acorn][Rank.king];
        Assert.equal(order.orderOf(card), 16);
      });

      it('should return 18 for acorn ace', () => {
        let card = Card[Suit.acorn][Rank.ace];
        Assert.equal(order.orderOf(card), 18);
      });

      it('should return 24 for heart ace', () => {
        let card = Card[Suit.heart][Rank.ace];
        Assert.equal(order.orderOf(card), 24);
      });

      it('should return 25 for bell sergeant', () => {
        let card = Card[Suit.bell][Rank.sergeant];
        Assert.equal(order.orderOf(card), 25);
      });

      it('should return 29 for bell officer', () => {
        let card = Card[Suit.bell][Rank.officer];
        Assert.equal(order.orderOf(card), 29);
      });

      it('should return 32 for acorn officer', () => {
        let card = Card[Suit.acorn][Rank.officer];
        Assert.equal(order.orderOf(card), 32);
      });
    });
  });
});
