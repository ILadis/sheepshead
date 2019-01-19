
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

Game.prototype.onbid =
Game.prototype.onplay =
Game.prototype.onproceed = function(...args) {
  return new Promise((resolve, reject) => {
    this.promise = { args, resolve, reject };
  });
};

Game.prototype.onbidded =
Game.prototype.onplayed =
Game.prototype.onmatched =
Game.prototype.oncompleted =
Game.prototype.onfinished = async function(...args) {
};

