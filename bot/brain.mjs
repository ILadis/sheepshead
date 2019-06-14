
import { Contract } from '../contract.mjs';

export function Brainless(rand = Math.random) {
  this.rand = rand;
}

Brainless.prototype.onbid = function(game) {
  let options = Array.from(Contract).filter(c => c.value == 1);
  return this.choose(options);
};

Brainless.prototype.onplay = function(game) {
  let options = Array.from(game.actor.cards);
  return this.choose(options);
};

Brainless.prototype.choose = function(options) {
  let index = Math.round(this.rand() * options.length);
  return options[index];
};

