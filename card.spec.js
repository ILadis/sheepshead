
import Assert from 'assert';
import { Card, Suit, Rank } from './card.mjs';

describe('Card', () => {
  it('should hold instances for all suits and ranks', () => {
    for (let suit of Suit) {
      for (let rank of Rank) {
        Assert.ok(Card[suit][rank]);
      }
    }
  });

  describe('#points()', () => {
    it('should return 11 for any ace', () => {
      for (let suit of Suit) {
        let card = Card[suit][Rank.ace];
        let points = card.points();
        Assert.equal(points, 11);
      }
    });

    it('should return 10 for any ten', () => {
      for (let suit of Suit) {
        let card = Card[suit][Rank.ten];
        let points = card.points();
        Assert.equal(points, 10);
      }
    });

    it('should return 4 for any king', () => {
      for (let suit of Suit) {
        let card = Card[suit][Rank.king];
        let points = card.points();
        Assert.equal(points, 4);
      }
    });

    it('should return 3 for any officer', () => {
      for (let suit of Suit) {
        let card = Card[suit][Rank.officer];
        let points = card.points();
        Assert.equal(points, 3);
      }
    });

    it('should return 2 for any sergeant', () => {
      for (let suit of Suit) {
        let card = Card[suit][Rank.sergeant];
        let points = card.points();
        Assert.equal(points, 2);
      }
    });

    it('should return 0 for any nine', () => {
      for (let suit of Suit) {
        let card = Card[suit][Rank.nine];
        let points = card.points();
        Assert.equal(points, 0);
      }
    });

    it('should return 0 for any eight', () => {
      for (let suit of Suit) {
        let card = Card[suit][Rank.eight];
        let points = card.points();
        Assert.equal(points, 0);
      }
    });

    it('should return 0 for any seven', () => {
      for (let suit of Suit) {
        let card = Card[suit][Rank.seven];
        let points = card.points();
        Assert.equal(points, 0);
      }
    });
  });
});

describe('Suit', () => {
  it('should be iterable', () => {
    Assert.ok(Suit[Symbol.iterator]);
  });

  it('should hold symbols of all suits', () => {
    Assert.equal(typeof Suit.bell, 'symbol');
    Assert.equal(typeof Suit.heart, 'symbol');
    Assert.equal(typeof Suit.leaf, 'symbol');
    Assert.equal(typeof Suit.acorn, 'symbol');
  });

  describe('#iterator', () => {
    it('should yield suits in natural order', () => {
      let it = Suit[Symbol.iterator]();
      Assert.equal(it.next().value, Suit.bell);
      Assert.equal(it.next().value, Suit.heart);
      Assert.equal(it.next().value, Suit.leaf);
      Assert.equal(it.next().value, Suit.acorn);
      Assert.ok(it.next().done);
    });
  });
});

describe('Rank', () => {
  it('should be iterable', () => {
    Assert.ok(Rank[Symbol.iterator]);
  });

  it('should hold symbols of all ranks', () => {
    Assert.equal(typeof Rank.seven, 'symbol');
    Assert.equal(typeof Rank.eight, 'symbol');
    Assert.equal(typeof Rank.nine, 'symbol');
    Assert.equal(typeof Rank.sergeant, 'symbol');
    Assert.equal(typeof Rank.officer, 'symbol');
    Assert.equal(typeof Rank.king, 'symbol');
    Assert.equal(typeof Rank.ten, 'symbol');
    Assert.equal(typeof Rank.ace, 'symbol');
  });

  describe('#iterator', () => {
    it('should yield ranks in natural order', () => {
      let it = Rank[Symbol.iterator]();
      Assert.equal(it.next().value, Rank.seven);
      Assert.equal(it.next().value, Rank.eight);
      Assert.equal(it.next().value, Rank.nine);
      Assert.equal(it.next().value, Rank.sergeant);
      Assert.equal(it.next().value, Rank.officer);
      Assert.equal(it.next().value, Rank.king);
      Assert.equal(it.next().value, Rank.ten);
      Assert.equal(it.next().value, Rank.ace);
      Assert.ok(it.next().done);
    });
  });
});

