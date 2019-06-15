
import { Game } from '../game.mjs';
import { Player } from '../player.mjs';

export function Bot(index, brain) {
  Player.call(this, `Bot ${index}`, index);

  this.brain = brain;
  this.thinktime = 500;
}

Bot.prototype = Object.create(Player.prototype);

Bot.prototype.attach = function(game) {
  this.game = game;

  for (let event in Game.prototype) {
    if (event.startsWith('on')) {
      this.connect(event);
    }
  }
};

Bot.prototype.connect = function(event) {
  let { game, brain } = this;

  if (event in brain) {
    let callback = game[event].bind(game);
    let brainify = brain[event].bind(brain);

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
  return new Promise((resolve) => {
    setTimeout(() => resolve(result), time);
  });
};

