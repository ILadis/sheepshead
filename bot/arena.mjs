
import { Game } from '../game.mjs';
import { Bot } from './bot.mjs';

export function Arena() {
  this.brains = new Set();
}

Arena.prototype.add = function(brain) {
  this.brains.add(brain);
};

Arena.prototype.compete = async function(runs = 100) {
  let game = new Game();
  let brains = this.brains.values();

  game.onjoin = (index) => {
    let brain = brains.next().value;

    let bot = new Bot(index, brain);
    bot.attach(game);

    return bot;
  };

  game.onproceed = () => {
    return --runs >= 0;
  };

  await game.run();

  let scores = game.scores;
  let bots = game.players;

  return { scores, bots };
};

