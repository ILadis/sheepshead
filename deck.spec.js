
import Assert from 'assert';
import { Deck } from './deck.mjs';
import { Card, Suit, Rank } from './card.mjs';

describe('Deck', () => {
  it('should be iterable', () => {
    let deck = new Deck();
    Assert.ok(deck[Symbol.iterator]);
  });

  describe('#iterator', () => {
    it('should yield cards in order', () => {
      let deck = new Deck();
      let first = Card[Suit.leaf][Rank.ace];
      let second = Card[Suit.leaf][Rank.sergeant];
      let third = Card[Suit.leaf][Rank.seven];
      deck.add(first, second, third);
      let it = deck[Symbol.iterator]();
      Assert.equal(it.next().value, first);
      Assert.equal(it.next().value, second);
      Assert.equal(it.next().value, third);
      Assert.ok(it.next().done);
    });
  });

  describe('#shuffle()', () => {
    it('should shuffle cards according to random', () => {
      let random = () => 0.5;
      let deck = new Deck();
      deck.add(Card[Suit.leaf][Rank.ace]);
      deck.add(Card[Suit.leaf][Rank.sergeant]);
      deck.add(Card[Suit.leaf][Rank.seven]);
      deck.add(Card[Suit.leaf][Rank.king]);
      deck.shuffle(random);
      let cards = Array.from(deck);
      Assert.deepEqual(cards, [
        Card[Suit.leaf][Rank.ace],
        Card[Suit.leaf][Rank.king],
        Card[Suit.leaf][Rank.sergeant],
        Card[Suit.leaf][Rank.seven]
      ]);
    });
  });

  describe('#sort()', () => {
    it('should sort cards according to comparator', () => {
      let comparator = (c1, c2) => c2.points() - c1.points();
      let deck = new Deck();
      deck.add(Card[Suit.leaf][Rank.seven]);
      deck.add(Card[Suit.leaf][Rank.sergeant]);
      deck.add(Card[Suit.leaf][Rank.ace]);
      deck.add(Card[Suit.leaf][Rank.king]);
      deck.sort(comparator);
      let cards = Array.from(deck);
      Assert.deepEqual(cards, [
        Card[Suit.leaf][Rank.ace],
        Card[Suit.leaf][Rank.king],
        Card[Suit.leaf][Rank.sergeant],
        Card[Suit.leaf][Rank.seven]
      ]);
    });
  });

  describe('#add()', () => {
    it('should add cards in given order', () => {
      let deck = new Deck();
      deck.add(Card[Suit.leaf][Rank.ace]);
      deck.add(Card[Suit.leaf][Rank.sergeant]);
      deck.add(Card[Suit.leaf][Rank.seven]);
      let cards = Array.from(deck);
      Assert.deepEqual(cards, [
        Card[Suit.leaf][Rank.ace],
        Card[Suit.leaf][Rank.sergeant],
        Card[Suit.leaf][Rank.seven]
      ]);
    });
  });

  describe('#draw()', () => {
    it('should remove and return 4 topmost cards', () => {
      let deck = new Deck();
      deck.add(Card[Suit.leaf][Rank.ace]);
      deck.add(Card[Suit.heart][Rank.sergeant]);
      deck.add(Card[Suit.leaf][Rank.seven]);
      deck.add(Card[Suit.bell][Rank.king]);
      deck.add(Card[Suit.bell][Rank.ace]);
      let cards = deck.draw();
      Assert.deepEqual(cards, [
        Card[Suit.leaf][Rank.ace],
        Card[Suit.heart][Rank.sergeant],
        Card[Suit.leaf][Rank.seven],
        Card[Suit.bell][Rank.king]
      ]);
      let remaining = Array.from(deck);
      Assert.deepEqual(remaining, [
        Card[Suit.bell][Rank.ace]
      ]);
    });
  });

  describe('#remove()', () => {
    it('should remove given cards', () => {
      let deck = new Deck();
      deck.add(Card[Suit.leaf][Rank.ace]);
      deck.add(Card[Suit.leaf][Rank.sergeant]);
      deck.add(Card[Suit.leaf][Rank.seven]);
      deck.remove(Card[Suit.leaf][Rank.seven]);
      deck.remove(Card[Suit.leaf][Rank.ace]);
      let cards = Array.from(deck);
      Assert.deepEqual(cards, [
        Card[Suit.leaf][Rank.sergeant]
      ]);
    });
  });

  describe('#contains()', () => {
    it('should return true when deck has given card', () => {
      let deck = new Deck();
      let first = Card[Suit.leaf][Rank.ace];
      let second = Card[Suit.leaf][Rank.sergeant];
      let third = Card[Suit.leaf][Rank.seven];
      deck.add(first, second);
      Assert.ok(deck.contains(second));
      Assert.ok(!deck.contains(third));
    });
  });

  describe('#empty()', () => {
    it('should return true on new deck', () => {
      let deck = new Deck();
      Assert.ok(deck.empty());
    });

    it('should return true when deck is cleared', () => {
      let deck = new Deck();
      deck.add(Card[Suit.leaf][Rank.ace]);
      deck.add(Card[Suit.leaf][Rank.sergeant]);
      deck.clear();
      Assert.ok(deck.empty());
    });

    it('should return true when all cards are drawn', () => {
      let deck = new Deck();
      deck.add(Card[Suit.leaf][Rank.ace]);
      deck.add(Card[Suit.leaf][Rank.sergeant]);
      deck.draw(2);
      Assert.ok(deck.empty());
    });

    it('should return false when cards are added', () => {
      let deck = new Deck();
      deck.add(Card[Suit.leaf][Rank.ace]);
      deck.add(Card[Suit.leaf][Rank.sergeant]);
      Assert.ok(!deck.empty());
    });
  });
});

