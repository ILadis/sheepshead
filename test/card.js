
import Assert from 'assert';
import { Card, Suit, Rank } from '../card.mjs';

describe('Card', () => {
  it('should hold instances for all suits and ranks', () => {
    for (let suit of Suit) {
      for (let rank of Rank) {
        Assert.ok(Card[suit][rank]);
      }
    }
  });

  describe('#points()', () => {
    [ [Rank.ace, 11],
      [Rank.ten, 10],
      [Rank.king, 4],
      [Rank.officer, 3],
      [Rank.sergeant, 2],
      [Rank.nine, 0],
      [Rank.eight, 0],
      [Rank.seven, 0],
    ].forEach(([rank, points]) => {
      it(`should return ${points} for any ${rank.description}`, () => {
        for (let suit of Suit) {
          let card = Card[suit][rank];
          Assert.equal(card.points(), points);
        }
      });
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

