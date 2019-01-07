
import * as Phases from './phases.mjs';

export function Game() {
  this.phase = Phases.Setup;
};

Game.prototype.run = async function() {
  let phase = this.phase;
  let game = this;

  do {
    phase = await phase(game);
  } while (phase);
};

Game.prototype.onplay = async function(player, trick) {
  return player.cards.pop();
};

Game.prototype.onplayed = async function(player, card, trick) {};
Game.prototype.oncompleted = async function(trick, winner) {};

