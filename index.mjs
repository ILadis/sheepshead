
import * as Phases from './phases.mjs';

let game = {};
let phase = Phases.Setup;

game.onplay = async function(player) {
  return player.cards.pop();
};

game.onplayed = async function(player, card) {
  console.log(`${player} played ${card} with value ${this.order.valueOf(card)}`);
};

game.onwon = async function(winner) {
  console.log(`Winner of this trick is: ${winner}`);
};

(async function() {
  do {
    console.log(`Phase: ${phase.name}...`);

    phase = await phase(game);
  } while (phase);
})();

