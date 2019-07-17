
import { Game } from '../../game.mjs';
import { Bot } from '../bot.mjs';

export function Arena() {
  this.brains = new Set();
}

Arena.prototype.join = function(brain) {
  this.brains.add(brain);
};

Arena.prototype.compete = async function(runs, callback) {
  let game = new Game();
  let brains = this.brains.values();

  game.onjoin = (index) => {
    let brain = brains.next().value;

    let bot = new Bot(index, brain);
    bot.thinktime = 0;

    bot.attach(game);

    return bot;
  };

  game.onproceed = () => {
    callback();
    return --runs >= 0;
  };

  await game.run();

  return {
    scores: game.scores,
    bots: game.players
  };
};

