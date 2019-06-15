
import { Contract } from '../contract.mjs';

export function Brainless(rand = Math.random) {
  this.rand = rand;
}

Brainless.prototype.chooseFrom = function(options) {
  let index = Math.round(this.rand() * options.length);
  return options[index];
};

Brainless.prototype.onbid = function() {
  let options = Array.from(Contract).filter(c => c.value == 1);
  return this.chooseFrom(options);
};

Brainless.prototype.onplay = function(game, player) {
  let options = Array.from(player.cards);
  return this.chooseFrom(options);
};

