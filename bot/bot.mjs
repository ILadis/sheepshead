
import { Game } from '../game.mjs';
import { Player } from '../player.mjs';

export function Bot(index, brain) {
  Player.call(this, `Bot ${index}`, index);

  this.callbacks = new Map();
  this.brain = brain;
  this.thinktime = 500;
}

Bot.prototype = Object.create(Player.prototype);

Bot.prototype.attach = function(game) {
  this.detach();
  this.game = game;

  for (let event in Game.prototype) {
    if (event.startsWith('on')) {
      this.connect(event);
    }
  }
};

Bot.prototype.detach = function() {
  let { game, callbacks } = this;

  if (game) {
    for (let [event, callback] in callbacks) {
      game[event] = callback;
    }
  }

  callbacks.clear();
};

Bot.prototype.connect = function(event) {
  let { game, brain, callbacks } = this;

  if (event in brain) {
    let callback = game[event].bind(game);
    let brainify = brain[event].bind(brain);

    callbacks.set(event, callback);

    game[event] = (...args) => {
      let other = callback(...args);
      let brain = brainify(game, ...args);

      if (this == game.actor) {
        return this.defer(brain);
      }

      return other;
    };
  }
};

Bot.prototype.defer = function(result) {
  let time = this.thinktime;
  if (time <= 0) {
    return result;
  }

  return new Promise((resolve) => {
    setTimeout(() => resolve(result), time);
  });
};

