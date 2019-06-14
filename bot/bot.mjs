
import { Player } from '../player.mjs';

export function Bot(index, brain) {
  Player.call(this, `Bot ${index}`, index);
  this.occurrences = new Set();
  this.thinktime = 500;
  this.brain = brain;
}

Bot.prototype = Object.create(Player.prototype);

Bot.prototype.connect = function(event, act = false) {
  var event = 'on' + event;
  let { game, brain } = this;

  if (event in brain) {
    let callback = game[event].bind(game);
    let brainify = brain[event].bind(brain);

    game[event] = (...args) => {
      if (act && game.actor === this) {
        return this.defer(() => brainify(game));
      }
      brainify(game);
      return callback(...args);
    };
  }
};

Bot.prototype.defer = function(callback) {
  let time = this.thinktime;
  return new Promise((resolve) => {
    setTimeout(() => resolve(callback()), time);
  });
};

Bot.prototype.attach = function(game) {
  this.game = game;

  let notifier = ['played'];
  for (let event of notifier) {
    this.connect(event);
  }

  let actions = ['bid', 'play'];
  for (let event of actions) {
    this.connect(event, true);
  }
};

