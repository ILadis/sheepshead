
import * as Phases from './phases.mjs';
import { Suits } from './card.mjs';
import { Contract } from './contract.mjs';

export function Game() {
  this.phase = Phases.setup;
};

Game.prototype.run = async function() {
  do {
    this.phase = await this.phase(this);
  } while (this.phase);
};

Game.prototype.onbid = async function(player) {};
Game.prototype.onplay = async function(player, trick) {};

Game.prototype.onbidded = async function(contract) {};
Game.prototype.onplayed = async function(player, card, trick) {};
Game.prototype.onmatched = async function(contract) {};
Game.prototype.oncompleted = async function(trick, winner) {};
Game.prototype.onfinished = async function(winner, looser) {};
Game.prototype.onproceed = async function(player) {};

