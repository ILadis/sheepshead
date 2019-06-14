
import Assert from 'assert';
import { Player } from './player.mjs';
import { Deck } from './deck.mjs';

describe('Player', () => {
  let player1 = new Player();
  let player2 = new Player();
  let player3 = new Player();
  let player4 = new Player();

  it('should have cards property', () => {
    let player = new Player();
    Assert.ok(player.cards instanceof Deck);
  });

  it('should have name/index property from constructor', () => {
    let name = 'Some Player';
    let index = 3;
    let player = new Player(name, index);
    Assert.equal(player.name, name);
    Assert.equal(player.index, index);
  });

  it('should initially have 0 points', () => {
    let player = new Player();
    Assert.equal(player.points, 0);
  });

  describe('#sequence()', () => {
    it('should return iterator factory', () => {
      let factory = Player.sequence([player1, player2], player1);
      let it1 = factory[Symbol.iterator]();
      Assert.ok(it1.next);
      let it2 = factory[Symbol.iterator]();
      Assert.ok(it2.next);
    });

    it('should iterate through players from given start', () => {
      let players = [player1, player2, player3, player4];
      let factory = Player.sequence(players, player3);
      let it = factory[Symbol.iterator]();
      Assert.equal(it.next().value, player3);
      Assert.equal(it.next().value, player4);
      Assert.equal(it.next().value, player1);
      Assert.equal(it.next().value, player2);
      Assert.ok(it.next().done);
    });
  });

  describe('#next()', () => {
    it('should return next player from given start', () => {
      let players = [player1, player2, player3, player4];
      Assert.equal(Player.next(players, player1), player2);
      Assert.equal(Player.next(players, player2), player3);
      Assert.equal(Player.next(players, player3), player4);
      Assert.equal(Player.next(players, player4), player1);
    });
  });
});

