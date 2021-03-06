
import * as Phases from './phases.mjs';

export function Game() {
  this.phase = Phases.joining;
};

Game.prototype.run = async function() {
  do {
    this.phase = await this.phase(this);
  } while (this.phase);
};

Game.prototype.onjoin =
Game.prototype.onbid =
Game.prototype.onplay =
Game.prototype.onturn =
Game.prototype.onproceed =

Game.prototype.onjoined =
Game.prototype.ondealt =
Game.prototype.oncontested =
Game.prototype.onbidded =
Game.prototype.onsettled =
Game.prototype.onplayed =
Game.prototype.onmatched =
Game.prototype.oncompleted =
Game.prototype.onfinished =
Game.prototype.onexited = async function(...args) {
};

