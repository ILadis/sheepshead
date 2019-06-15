
import { Game } from '../game.mjs';

import { Bot } from './bot.mjs';
import { Brainless } from './brainless.mjs';

export async function train(brain, iterations, callback) {
  let game = new Game();
  let step = 1/4;

  game.onjoin = (index) => {
    let brain = new Brainless();
    let bot = new Bot(index, brain);
    bot.thinktime = 0;

    bot.attach(game);

    return bot;
  };

  game.onproceed = () => {
    iterations -= step;
    callback(iterations);
    return iterations > 0;
  };

  let bot = new Bot(1, brain);
  bot.attach(game);

  callback(iterations);
  await game.run();

  return brain;
}

