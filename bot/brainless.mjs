
import { Contract } from '../contract.mjs';

export function Brainless(rand = Math.random) {
  this.rand = rand;
}

Brainless.prototype.chooseFrom = function(options) {
  let index = Math.floor(this.rand() * options.length);
  return options[index];
};

Brainless.prototype.onbid = function(game, player, rules) {
  let contracts = Array.from(Contract).filter(c => c.value == 1);
  let options = Array.from(rules.options(contracts));
  return this.chooseFrom(options);
};

Brainless.prototype.onplay = function(game, player, rules) {
  let cards = Array.from(player.cards);
  let options = Array.from(rules.options(cards));
  return this.chooseFrom(options);
};

