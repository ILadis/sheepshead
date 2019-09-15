
import Assert from 'assert';
import { Player } from '../player.mjs';
import { Deck } from '../deck.mjs';

describe('Player', () => {
  let player1 = new Player(),
    player2 = new Player(),
    player3 = new Player(),
    players = new Array(player1, player2, player3);

  it('should have cards property', () => {
    let player = new Player();
    Assert.ok(player.cards instanceof Deck);
  });

  it('should have name/index property from constructor', () => {
    let player = new Player('Player', 3);
    Assert.equal(player.name, 'Player');
    Assert.equal(player.index, 3);
  });

  describe('#sequence()', () => {
    it('should be iterable', () => {
      let sequence = Player.sequence(players, player1);
      Assert.ok(sequence[Symbol.iterator]);
    });

    it('should yield players from given start', () => {
      let sequence = Player.sequence(players, player3);
      let it = sequence[Symbol.iterator]();
      Assert.equal(it.next().value, player3);
      Assert.equal(it.next().value, player1);
      Assert.equal(it.next().value, player2);
      Assert.ok(it.next().done);
    });
  });

  describe('#next()', () => {
    it('should return next player from given start', () => {
      let next = Player.next(players, player3);
      Assert.equal(next, player1);
    });
  });
});

