
import Assert from 'assert';
import { Card, Suits, Ranks } from './card.mjs';

describe('Card', () => {
  it('should hold instances for all suits and ranks', () => {
    for (let suit of Suits) {
      for (let rank of Ranks) {
        Assert.ok(Card[suit][rank] instanceof Card);
      }
    }
  });

  describe('#points()', () => {
    it('should return 11 for any ace', () => {
      for (let suit of Suits) {
        let card = Card[suit][Ranks.Ace];
        let points = card.points();
        Assert.equal(points, 11);
      }
    });

    it('should return 10 for any ten', () => {
      for (let suit of Suits) {
        let card = Card[suit][Ranks.Ten];
        let points = card.points();
        Assert.equal(points, 10);
      }
    });

    it('should return 4 for any king', () => {
      for (let suit of Suits) {
        let card = Card[suit][Ranks.King];
        let points = card.points();
        Assert.equal(points, 4);
      }
    });

    it('should return 3 for any officer', () => {
      for (let suit of Suits) {
        let card = Card[suit][Ranks.Officer];
        let points = card.points();
        Assert.equal(points, 3);
      }
    });

    it('should return 2 for any sergeant', () => {
      for (let suit of Suits) {
        let card = Card[suit][Ranks.Sergeant];
        let points = card.points();
        Assert.equal(points, 2);
      }
    });

    it('should return 0 for any nine', () => {
      for (let suit of Suits) {
        let card = Card[suit][Ranks.Nine];
        let points = card.points();
        Assert.equal(points, 0);
      }
    });

    it('should return 0 for any eight', () => {
      for (let suit of Suits) {
        let card = Card[suit][Ranks.Eight];
        let points = card.points();
        Assert.equal(points, 0);
      }
    });

    it('should return 0 for any seven', () => {
      for (let suit of Suits) {
        let card = Card[suit][Ranks.Seven];
        let points = card.points();
        Assert.equal(points, 0);
      }
    });
  });

  describe('#byName()', () => {
    it('should return card matching suit/rank name', () => {
      var card = Card.byName('Leaf', 'Ace');
      Assert.equal(card, Card[Suits.Leaf][Ranks.Ace]);

      var card = Card.byName('Heart', 'Nine');
      Assert.equal(card, Card[Suits.Heart][Ranks.Nine]);

      var card = Card.byName('Acorn', 'Ten');
      Assert.equal(card, Card[Suits.Acorn][Ranks.Ten]);
    });

    it('should return undefined for invalid suit name', () => {
      let card = Card.byName('Spade', 'Ace');
      Assert.equal(card, undefined);
    });

    it('should return undefined for invalid rank name', () => {
      let card = Card.byName('Leaf', 'Queen');
      Assert.equal(card, undefined);
    });

    it('should ignore case of suit name', () => {
      let names = ['Leaf', 'leaf', 'lEAf', 'lEaF'];
      for (let name of names) {
        let card = Card.byName(name, 'Ace');
        Assert.equal(card, Card[Suits.Leaf][Ranks.Ace]);
      }
    });

    it('should ignore case of rank name', () => {
      let names = ['Ace', 'aCE', 'ACE', 'acE', 'ace'];
      for (let name of names) {
        let card = Card.byName('Leaf', name);
        Assert.equal(card, Card[Suits.Leaf][Ranks.Ace]);
      }
    });
  });
});

describe('Suits', () => {
  it('should be iterable', () => {
    Assert.ok(Suits[Symbol.iterator]);
  });

  it('should hold symbols of all suits', () => {
    Assert.equal(typeof Suits.Bell, 'symbol');
    Assert.equal(typeof Suits.Heart, 'symbol');
    Assert.equal(typeof Suits.Leaf, 'symbol');
    Assert.equal(typeof Suits.Acorn, 'symbol');
  });

  describe('#iterator', () => {
    it('should yield suits in natural order', () => {
      let it = Suits[Symbol.iterator]();
      Assert.equal(it.next().value, Suits.Bell);
      Assert.equal(it.next().value, Suits.Heart);
      Assert.equal(it.next().value, Suits.Leaf);
      Assert.equal(it.next().value, Suits.Acorn);
      Assert.ok(it.next().done);
    });
  });
});

describe('Ranks', () => {
  it('should be iterable', () => {
    Assert.ok(Ranks[Symbol.iterator]);
  });

  it('should hold symbols of all ranks', () => {
    Assert.equal(typeof Ranks.Seven, 'symbol');
    Assert.equal(typeof Ranks.Eight, 'symbol');
    Assert.equal(typeof Ranks.Nine, 'symbol');
    Assert.equal(typeof Ranks.Sergeant, 'symbol');
    Assert.equal(typeof Ranks.Officer, 'symbol');
    Assert.equal(typeof Ranks.King, 'symbol');
    Assert.equal(typeof Ranks.Ten, 'symbol');
    Assert.equal(typeof Ranks.Ace, 'symbol');
  });

  describe('#iterator', () => {
    it('should yield ranks in natural order', () => {
      let it = Ranks[Symbol.iterator]();
      Assert.equal(it.next().value, Ranks.Seven);
      Assert.equal(it.next().value, Ranks.Eight);
      Assert.equal(it.next().value, Ranks.Nine);
      Assert.equal(it.next().value, Ranks.Sergeant);
      Assert.equal(it.next().value, Ranks.Officer);
      Assert.equal(it.next().value, Ranks.King);
      Assert.equal(it.next().value, Ranks.Ten);
      Assert.equal(it.next().value, Ranks.Ace);
      Assert.ok(it.next().done);
    });
  });
});

