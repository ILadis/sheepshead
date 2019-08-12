
import Assert from 'assert';
import { Deck } from '../deck.mjs';
import { Card, Suit, Rank } from '../card.mjs';

describe('Deck', () => {
  const deck = new Deck(),
    card1 = Card[Suit.leaf][Rank.ace],
    card2 = Card[Suit.leaf][Rank.sergeant],
    card3 = Card[Suit.leaf][Rank.seven],
    card4 = Card[Suit.leaf][Rank.king];

  beforeEach(() => {
    deck.clear();
    deck.addAll([card1, card2, card3, card4]);
  });

  it('should be iterable', () => {
    Assert.ok(deck[Symbol.iterator]);
  });

  describe('#iterator', () => {
    it('should yield cards in insertion order', () => {
      let it = deck[Symbol.iterator]();
      Assert.equal(it.next().value, card1);
      Assert.equal(it.next().value, card2);
      Assert.equal(it.next().value, card3);
      Assert.equal(it.next().value, card4);
      Assert.ok(it.next().done);
    });
  });

  describe('#fill()', () => {
    it('should add all available cards', () => {
      let deck = new Deck();
      deck.fill();
      Assert.equal(deck.size(), 32);
    });
  });

  describe('#shuffle()', () => {
    it('should shuffle cards according to random', () => {
      let random = () => 0.5;
      deck.shuffle(random);
      let cards = Array.from(deck);
      Assert.deepEqual(cards, [card1, card4, card2, card3]);
    });
  });

  describe('#sort()', () => {
    it('should sort cards according to comparator', () => {
      let comparator = (c1, c2) => c2.points() - c1.points();
      deck.sort(comparator);
      let cards = Array.from(deck);
      Assert.deepEqual(cards, [card1, card4, card2, card3]);
    });
  });

  describe('#draw()', () => {
    it('should remove and return topmost cards', () => {
      let drawn = deck.draw(3);
      let remaining = Array.from(deck);
      Assert.deepEqual(drawn, [card1, card2, card3]);
      Assert.deepEqual(remaining, [card4]);
    });
  });

  describe('#remove()', () => {
    it('should remove given card', () => {
      deck.remove(card2);
      deck.remove(card4);
      let cards = Array.from(deck);
      Assert.deepEqual(cards, [card1, card3]);
    });
  });

  describe('#contains()', () => {
    it('should return true when deck has card', () => {
      let card = Card[Suit.leaf][Rank.ace];
      Assert.equal(deck.contains(card), true);
    });

    it('should return false when deck is missing card', () => {
      let card = Card[Suit.bell][Rank.seven];
      deck.addAll([card1, card2]);
      Assert.equal(deck.contains(card), false);
    });
  });

  describe('#empty()', () => {
    it('should return true on new deck', () => {
      let deck = new Deck();
      Assert.equal(deck.empty(), true);
    });

    it('should return true when deck is cleared', () => {
      deck.clear();
      Assert.equal(deck.empty(), true);
    });

    it('should return true when all cards are drawn', () => {
      deck.draw(4);
      Assert.equal(deck.empty(), true);
    });

    it('should return false when deck contains cards', () => {
      Assert.equal(deck.empty(), false);
    });
  });
});

