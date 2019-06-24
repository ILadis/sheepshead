
import Assert from 'assert';
import { Scoreboard, Result } from './scoreboard.mjs';
import { Contract } from './contract.mjs';
import { Player } from './player.mjs';
import { Trick } from './trick.mjs';
import { Card, Suit, Rank } from './card.mjs';

describe('Scoreboard', () => {
  let player1 = new Player();
  let player2 = new Player();
  let player3 = new Player();

  let contract = Contract.normal.leaf;
  contract.partner = player3;
  contract.assign(player1);

  describe('#result', () => {
    it('should return results/scores for winner/loser', () => {
      let board = new Scoreboard([player1, player2, player3]);

      var trick = new Trick();
      trick.add(player1, Card[Suit.leaf][Rank.king]);
      board.claim(player1, trick);

      var trick = new Trick();
      trick.add(player2, Card[Suit.heart][Rank.ace]);
      trick.add(player1, Card[Suit.leaf][Rank.ten]);
      board.claim(player2, trick);

      var trick = new Trick();
      trick.add(player3, Card[Suit.bell][Rank.ace]);
      trick.add(player2, Card[Suit.acorn][Rank.ten]);
      board.claim(player3, trick);

      let { winner } = board.result(contract);
      Assert.equal(winner.score, 10);

      let players = Array.from(winner.players);
      Assert.deepEqual(players, [player1, player3]);
    });
  });
});

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
      result.add(player1, []);
      result.add(player2, []);
      let players = Array.from(result.players);
      Assert.deepEqual(players, [player1, player2]);
    });
  });

  describe('#points()', () => {
    it('should return total result points', () => {
      let result = new Result();
      let player = new Player();

      var trick1 = new Trick();
      trick1.add(player, Card[Suit.leaf][Rank.ace]);

      let trick2 = new Trick();
      trick2.add(player, Card[Suit.leaf][Rank.king]);

      result.add(player, [trick1, trick2]);
      Assert.equal(result.points(), 15);
    });
  });

  describe('#matadors', () => {
    it('should return number of matadors', () => {
      let result = new Result();
      let player1 = new Player();
      let player2 = new Player();

      let trick1 = new Trick();
      trick1.add(player2, Card[Suit.leaf][Rank.officer]);
      trick1.add(player1, Card[Suit.heart][Rank.officer]);

      let trick2 = new Trick();
      trick2.add(player2, Card[Suit.acorn][Rank.officer]);

      let trick3 = new Trick();
      trick3.add(player2, Card[Suit.acorn][Rank.sergeant]);

      result.add(player1, [trick1]);
      result.add(player2, [trick2, trick3]);

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
    trick1.add(player1, Card[Suit.leaf][Rank.ace]);
    result1.add(player1, [trick1]);

    let result2 = new Result();
    let player2 = new Player();
    let trick2 = new Trick();
    trick2.add(player2, Card[Suit.leaf][Rank.king]);
    result2.add(player2, [trick2]);

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

