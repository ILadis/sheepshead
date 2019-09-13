
import Assert from 'assert';
import { Result } from '../result.mjs';
import { Contract } from '../contract.mjs';
import { Player } from '../player.mjs';
import { Trick } from '../trick.mjs';
import { Card, Suit, Rank } from '../card.mjs';

describe('Result', () => {
  it('should have iterable players property', () => {
    let result = new Result();
    Assert.ok(result.players[Symbol.iterator]);
  });

  it('should initially have 0 points', () => {
    let result = new Result();
    Assert.equal(result.points(), 0);
  });

  describe('#add()', () => {
    it('should add players to result', () => {
      let result = new Result();
      let player1 = new Player();
      let player2 = new Player();
      result.add(player1);
      result.add(player2);
      let players = Array.from(result.players);
      Assert.deepEqual(players, [player1, player2]);
    });
  });

  describe('#points()', () => {
    it('should return total result points', () => {
      let result = new Result();
      let player = new Player();

      let trick1 = new Trick();
      trick1.play(player, Card[Suit.leaf][Rank.ace]);
      player.tricks.add(trick1);

      let trick2 = new Trick();
      trick2.play(player, Card[Suit.leaf][Rank.king]);
      player.tricks.add(trick2);

      result.add(player);
      Assert.equal(result.points(), 15);
    });
  });

  describe('#matadors', () => {
    it('should return number of matadors', () => {
      let result = new Result();
      let player1 = new Player();
      let player2 = new Player();

      let trick1 = new Trick();
      trick1.play(player2, Card[Suit.leaf][Rank.officer]);
      trick1.play(player1, Card[Suit.heart][Rank.officer]);
      player1.tricks.add(trick1);

      let trick2 = new Trick();
      trick2.play(player2, Card[Suit.acorn][Rank.officer]);
      player2.tricks.add(trick2);

      let trick3 = new Trick();
      trick3.play(player2, Card[Suit.acorn][Rank.sergeant]);
      player2.tricks.add(trick3);

      result.add(player1);
      result.add(player2);

      let contract = Contract.normal.leaf;
      let trumps = contract.order.trumps;

      let matadors = result.matadors(trumps);
      Assert.equal(matadors, 3);
    });
  });

  describe('#compare()', () => {
    let result1 = new Result();
    let player1 = new Player();
    let trick1 = new Trick();
    trick1.play(player1, Card[Suit.leaf][Rank.ace]);
    player1.tricks.add(trick1);
    result1.add(player1);

    let result2 = new Result();
    let player2 = new Player();
    let trick2 = new Trick();
    trick2.play(player2, Card[Suit.leaf][Rank.king]);
    player2.tricks.add(trick2);
    result2.add(player2);

    it('should return result with higher points as winner', () => {
      let { winner } = Result.compare(result1, result2);
      Assert.equal(winner, result1);
    });

    it('should return result with lesser points as loser', () => {
      let { loser } = Result.compare(result1, result2);
      Assert.equal(loser, result2);
    });
  });
});

