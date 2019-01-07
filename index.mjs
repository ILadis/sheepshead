
import { Game } from './game.mjs';

let game = new Game();

game.onplayed = async function(player, card) {
  console.log(`${player} played ${card} with value ${this.order.valueOf(card)}`);
};

game.oncompleted = async function(trick, winner) {
  console.log(`Winner of this trick is: ${winner}`);
  console.log(`${winner} now has ${winner.points} point(s)`);
};

game.run();

