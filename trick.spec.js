
import Assert from 'assert';
import { Trick } from './trick.mjs';
import { Player } from './player.mjs';
import { Contract } from './contract.mjs';
import { Card, Suit, Rank } from './card.mjs';

describe('Trick', () => {
  let trick = new Trick();

  let first = Card[Suit.leaf][Rank.ace];
  let player1 = new Player('Player 1');
  trick.add(player1, first);

  let second = Card[Suit.leaf][Rank.sergeant];
  let player2 = new Player('Player 2');
  trick.add(player2, second);

  let third = Card[Suit.leaf][Rank.seven];
  let player3 = new Player('Player 3');
  trick.add(player3, third);

  describe('#cards()', () => {
    it('should return iterator of added cards', () => {
      let it = trick.cards();
      Assert.equal(it.next().value, first);
      Assert.equal(it.next().value, second);
      Assert.equal(it.next().value, third);
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
      Assert.equal(lead, first);
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
      trick.add(new Player('Player 1'), Card[Suit.leaf][Rank.ace]);
      Assert.ok(!trick.empty());
    });
  });

  describe('#winner()', () => {
    it('should return player with highest card ', () => {
      let contract = Contract.normal.leaf;
      let order = contract.order;
      let winner = trick.winner(order);
      Assert.equal(winner, player2);
    });
  });
});

