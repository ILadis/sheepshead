
import Assert from 'assert';
import { Auction } from '../auction.mjs';
import { Player } from '../player.mjs';
import { Contract } from '../contract.mjs';

describe('Auction', () => {
  let auction = new Auction(),
    contract1 = Contract.normal.leaf,
    contract2 = Contract.wenz.default,
    player1 = new Player('Player 1'),
    player2 = new Player('Player 2'),
    player3 = new Player('Player 3');

  beforeEach(() => {
    auction = new Auction();

    contract1.assign(player1);
    contract2.assign(player2);

    auction.bid(contract1);
    auction.bid(contract2);
  });

  describe('#includes()', () => {
    it('should return true if player is part of auction', () => {
      Assert.ok(auction.includes(player1));
    });

    it('should return false if player is not part of auction', () => {
      Assert.ok(!auction.includes(player3));
    });
  });

  describe('#concede', () => {
    it('should remove player bid from auction', () => {
      auction.concede(player1);
      let bidders = Array.from(auction.bidders());
      Assert.deepEqual(bidders, [player2]);
    });

    it('should do nothing when player is not part of auction', () => {
      auction.concede(player3);
      let bidders = Array.from(auction.bidders());
      Assert.deepEqual(bidders, [player1, player2]);
    });
  });

  describe('#bidders()', () => {
    it('should be iterable', () => {
      let bidders = auction.bidders();
      Assert.ok(bidders[Symbol.iterator]);
    });

    it('should yield players in order', () => {
      let bidders = auction.bidders();
      let it = bidders[Symbol.iterator]();
      Assert.equal(it.next().value, player1);
      Assert.equal(it.next().value, player2);
      Assert.ok(it.next().done);
    });
  });

  describe('#blind()', () => {
    it('should return number of bids', () => {
      let blind = auction.blind();
      Assert.equal(blind, 2);
    });
  });

  describe('#settled()', () => {
    it('should return false on new auctiob', () => {
      let auction = new Auction();
      Assert.ok(!auction.settled());
    });

    it('should return false when multiple bids exist', () => {
      Assert.ok(!auction.settled());
    });

    it('should return true when only one bid remains', () => {
      auction.concede(player2);
      Assert.ok(auction.settled());
    });
  });

  describe('#winner()', () => {
    it('should return contract with highest value', () => {
      let winner = auction.winner();
      Assert.equal(winner, contract2);
    });
  });
});

