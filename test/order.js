
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

      [ [Suit.acorn, Rank.ace, 0],
        [Suit.leaf, Rank.eight, 2],
        [Suit.leaf, Rank.officer, 4],
        [Suit.bell, Rank.sergeant, 15],
      ].forEach(([suit, rank, value]) => {
        it(`should return ${value} for ${suit.description} ${rank.description}`, () => {
          let card = Card[suit][rank];
          Assert.equal(order.valueOf(card), value);
        });
      });
    });

    describe('with heart/sergeant/officer trump', () => {
      let order = new Order();
      order.promote([Suit.heart], [Rank.sergeant, Rank.officer]);

      [ [Suit.heart, Rank.seven, 1],
        [Suit.heart, Rank.king, 4],
        [Suit.leaf, Rank.sergeant, 9],
        [Suit.bell, Rank.officer, 11],
      ].forEach(([suit, rank, value]) => {
        it(`should return ${value} for ${suit.description} ${rank.description}`, () => {
          let card = Card[suit][rank];
          Assert.equal(order.valueOf(card), value);
        });
      });
    });
  });

  describe('#orderOf()', () => {
    describe('with heart/sergeant/officer trump', () => {
      let order = new Order();
      order.promote([Suit.heart], [Rank.sergeant, Rank.officer]);

      [ [Suit.bell, Rank.seven, 1],
        [Suit.bell, Rank.ten, 5],
        [Suit.leaf, Rank.eight, 8],
        [Suit.acorn, Rank.king, 16],
        [Suit.acorn, Rank.ace, 18],
        [Suit.heart, Rank.ace, 24],
        [Suit.bell, Rank.sergeant, 25],
        [Suit.bell, Rank.officer, 29],
        [Suit.acorn, Rank.officer, 32],
      ].forEach(([suit, rank, value]) => {
        it(`should return ${value} for ${suit.description} ${rank.description}`, () => {
          let card = Card[suit][rank];
          Assert.equal(order.orderOf(card), value);
        });
      });
    });
  });
});

