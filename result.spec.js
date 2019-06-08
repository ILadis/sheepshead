
import Assert from 'assert';
import { Result } from './result.mjs';
import { Player } from './player.mjs';

describe('Result', () => {
  it('should have iterable players property', () => {
    let result = new Result();
    Assert.ok(result.players[Symbol.iterator]);
  });

  it('should initially have 0 points', () => {
    let result = new Result();
    Assert.equal(result.points, 0);
  });

  describe('#add()', () => {
    it('should add player to result', () => {
      let result = new Result();
      let player1 = new Player('Player 1');
      result.add(player1);
      let player2 = new Player('Player 2');
      result.add(player2);
      let players = Array.from(result.players);
      Assert.deepEqual(players, [player1, player2]);
    });

    it('should add player sum to result', () => {
      let result = new Result();
      let player1 = new Player('Player 1');
      player1.points = 8;
      result.add(player1);
      let player2 = new Player('Player 2');
      player2.points = 7;
      result.add(player2);
      Assert.equal(result.points, 15);
    });
  });

  describe('#compare()', () => {
    let result1 = new Result();
    let player1 = new Player('Player 1');
    player1.points = 8;
    result1.add(player1);

    let result2 = new Result();
    let player2 = new Player('Player 2');
    player2.points = 4;
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
