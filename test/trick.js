
import Assert from 'assert';
import { Trick } from '../trick.mjs';
import { Player } from '../player.mjs';
import { Contract } from '../contract.mjs';
import { Card, Suit, Rank } from '../card.mjs';

describe('Trick', () => {
  let trick = new Trick(),
    card1 = Card[Suit.leaf][Rank.ace],
    card2 = Card[Suit.leaf][Rank.sergeant],
    card3 = Card[Suit.leaf][Rank.seven],
    player1 = new Player('Player 1'),
    player2 = new Player('Player 2'),
    player3 = new Player('Player 3');

  beforeEach(() => {
    trick = new Trick();
    trick.play(player1, card1);
    trick.play(player2, card2);
    trick.play(player3, card3);
  });

  it('should be iterable', () => {
    Assert.ok(trick[Symbol.iterator]);
  });

  describe('#iterator', () => {
    it('should yield player and cards in play order', () => {
      let it = trick[Symbol.iterator]();
      Assert.deepEqual(it.next().value, {
        player: player1, card: card1
      });
      Assert.deepEqual(it.next().value, {
        player: player2, card: card2
      });
      Assert.deepEqual(it.next().value, {
        player: player3, card: card3
      });
      Assert.ok(it.next().done);
    });
  });

  describe('#includes()', () => {
    it('should return true if player has played card', () => {
      Assert.ok(trick.includes(player2));
    });

    it('should return false if player has not played card', () => {
      let trick = new Trick();
      Assert.ok(!trick.includes(player2));
    });
  });

  describe('#cards()', () => {
    it('should be iterable', () => {
      let cards = trick.cards();
      Assert.ok(cards[Symbol.iterator]);
    });

    it('should yield cards in play order', () => {
      let cards = trick.cards();
      let it = cards[Symbol.iterator]();
      Assert.equal(it.next().value, card1);
      Assert.equal(it.next().value, card2);
      Assert.equal(it.next().value, card3);
      Assert.ok(it.next().done);
    });
  });

  describe('#points()', () => {
    it('should return sum of card points', () => {
      let points = trick.points();
      Assert.equal(points, 13);
    });
  });

  describe('#lead()', () => {
    it('should return first card of trick', () => {
      let lead = trick.lead();
      Assert.equal(lead, card1);
    });

    it('should return undefined on new trick', () => {
      let trick = new Trick();
      let lead = trick.lead();
      Assert.equal(lead, undefined);
    });
  });

  describe('#empty()', () => {
    it('should return true on new trick', () => {
      let trick = new Trick();
      Assert.ok(trick.empty());
    });

    it('should return false when cards are added', () => {
      let trick = new Trick();
      trick.play(player1, card1);
      Assert.ok(!trick.empty());
    });
  });

  describe('#winner()', () => {
    it('should return player with highest card', () => {
      let contract = Contract.normal.leaf;
      let order = contract.order;
      let winner = trick.winner(order);
      Assert.equal(winner, player2);
    });
  });
});

