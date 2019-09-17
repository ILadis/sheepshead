
import Assert from 'assert';
import { Result } from '../result.mjs';
import { Trick } from '../trick.mjs';
import { Player } from '../player.mjs';
import { Contract } from '../contract.mjs';
import { Card, Suit, Rank } from '../card.mjs';

describe('Result', () => {
  let result = new Result(),
    player1 = new Player('Player 1'),
    player2 = new Player('Player 2'),
    player3 = new Player('Player 3'),
    trick1 = new Trick(),
    trick2 = new Trick(),
    trick3 = new Trick();

  beforeEach(() => {
    result = new Result(player1, player2);

    trick1 = new Trick();
    trick1.play(player1, Card[Suit.leaf][Rank.officer]);
    trick1.play(player2, Card[Suit.heart][Rank.officer]);

    trick2 = new Trick();
    trick2.play(player2, Card[Suit.acorn][Rank.officer]);
    trick2.play(player3, Card[Suit.bell][Rank.officer]);

    trick3 = new Trick();
    trick3.play(player3, Card[Suit.leaf][Rank.ace]);

    result.claim(trick1);
  });

  it('should have iterable players property', () => {
    let result = new Result();
    Assert.ok(result.players[Symbol.iterator]);
  });

  it('should initially have 0 points', () => {
    let result = new Result();
    Assert.equal(result.points(), 0);
  });

  describe('#claim()', () => {
    it('should add trick points to result', () => {
      result.claim(trick2);
      Assert.equal(result.points(), 12);
    });
  });

  describe('#add()', () => {
    it('should add player and claimed tricks', () => {
      let other = player3.result;
      other.claim(trick3);
      result.add(player3);
      let players = Array.from(result.players);
      Assert.deepEqual(players, [player1, player2, player3]);
      Assert.equal(result.points(), 17);
      Assert.equal(other.points(), 0);
    });
  });

  describe('#matadors', () => {
    it('should return number of matadors', () => {
      result.claim(trick2);
      let contract = Contract.normal.leaf;
      let trumps = contract.order.trumps;
      let matadors = result.matadors(trumps);
      Assert.equal(matadors, 3);
    });
  });

  describe('#compare()', () => {
    it('should return result with higher points as winner', () => {
      let other = new Result(player3);
      other.claim(trick3);
      let { winner } = Result.compare(result, other);
      Assert.equal(winner, other);
    });

    it('should return result with lesser points as loser', () => {
      let other = new Result(player3);
      other.claim(trick3);
      let { loser } = Result.compare(result, other);
      Assert.equal(loser, result);
    });
  });
});

