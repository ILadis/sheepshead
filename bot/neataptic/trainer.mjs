
import { Game } from '../../game.mjs';

import { Bot } from '../bot.mjs';
import { Brainless } from '../brainless.mjs';

export async function train(trainee, callback) {
  let rand = mulberry(12345);
  let iterations = 0;

  let game = new Game();
  game.rand = rand;

  game.onjoin = (index) => {
    let brain = new Brainless(rand);
    if (index == 1) {
      brain = trainee;
    }

    let bot = new Bot(index, brain);
    bot.thinktime = 0;

    bot.attach(game);

    return bot;
  };

  game.onproceed = async () => {
    return await callback(++iterations, trainee);
  };

  await game.run();

  return trainee;
}

function mulberry(seed) {
  return () => {
    let value = seed += 0x6D2B79F5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

