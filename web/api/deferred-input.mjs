
import { Player } from '../../player.mjs';
import { Contract } from '../../contract.mjs';

export function DeferredInput() {
  this.promise = null;
}

DeferredInput.prototype.attach = function(game) {
  game.input = this;
  game.onbid = async (player) => {
    let partner = Player.across(game.players, player);
    let contract = Contract.normal(player, partner);
    return contract;
  };

  game.onjoin =
  game.onplay = (...args) => {
    return new Promise((resolve, reject) => {
      this.promise = { resolve, reject };
      this.args = args;
    });
  };

  game.onproceed = async (player) => {
    return false;
  };
};

DeferredInput.prototype.resolve = function(...args) {
  this.promise.resolve(...args);
  this.promise = null;
};

