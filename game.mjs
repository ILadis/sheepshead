
import * as Phases from './phases.mjs';
import { Suits } from './card.mjs';
import { Contract } from './contract.mjs';

export function Game() {
  this.phase = Phases.joining;
};

Game.prototype.run = async function() {
  do {
    this.phase = await this.phase(this);
  } while (this.phase);
};

Game.prototype.register = function(event, callback) {
  let next = this[event];

  this[event] = (...args) => {
    let result = callback.call(this, ...args);
    if (next) {
      return next.call(this, ...args);
    }
    return result;
  };
};

Game.prototype.onjoin =
Game.prototype.onbid =
Game.prototype.onplay =
Game.prototype.onproceed =
Game.prototype.onjoined =
Game.prototype.onbidded =
Game.prototype.onplayed =
Game.prototype.onmatched =
Game.prototype.oncompleted =
Game.prototype.onfinished = async function(...args) {
};

