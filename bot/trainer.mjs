
import { Game } from '../game.mjs';

import { Bot } from './bot.mjs';
import { Brainless } from './brainless.mjs';

export async function train(brain, samples, iterations) {
  let bot = new Bot(1, brain);
  let step = 1/4;

  do {
    let rand = mulberry(12345);
    let count = samples;

    let game = new Game();
    game.rand = rand;

    bot.attach(game);

    game.onjoin = (index) => {
      let brain = new Brainless(rand);
      let bot = new Bot(index, brain);
      bot.thinktime = 0;

      bot.attach(game);

      return bot;
    };

    game.onproceed = () => {
      count -= step;
      return count > 0;
    };

    await game.run();
  } while (--iterations > 0);

  brain.trained = true;

  return brain;
}

function mulberry(seed) {
  return () => {
    let value = seed += 0x6D2B79F5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

