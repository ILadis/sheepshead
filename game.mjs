
import * as Phases from './phases.mjs';
import { Suits } from './card.mjs';
import { Contract } from './contract.mjs';

export function Game() {
};

Game.prototype.run = async function() {
  let phase = Phases.setup;

  do {
    this.phase = phase;
    phase = await phase(this);
  } while (phase);
};

Game.prototype.onbid = async function(player) {
  return Contract.solo(Suits.Heart);
};

Game.prototype.onplay = async function(player, trick) {
  return player.cards.pop();
};

Game.prototype.onbidded = async function(contract) {};
Game.prototype.onplayed = async function(player, card, trick) {};
Game.prototype.onmatched = async function(contract) {};
Game.prototype.oncompleted = async function(trick, winner) {};

