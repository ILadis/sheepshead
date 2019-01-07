
import * as Phases from './phases.mjs';

export function Game() {
};

Game.prototype.run = async function() {
  let phase = Phases.setup;

  do {
    this.phase = phase;
    phase = await phase(this);
  } while (phase);
};

Game.prototype.onplay = async function(player, trick) {
  return player.cards.pop();
};

Game.prototype.onplayed = async function(player, card, trick) {};
Game.prototype.oncompleted = async function(trick, winner) {};

