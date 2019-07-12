
import { Game } from '../../game.mjs';
import { Bot } from '../bot.mjs';

export async function train(brain, options = {}) {
  let epoch = 0;

  let {
    iterations = 1000,
    generations = 10,
    callback = () => {}
  } = options;

  do {
    let game = new Game();
    let runs = 0;

    game.onjoin = (index) => {
      let bot = new Bot(index, brain.clone());
      bot.thinktime = 0;
      bot.wins = 0;

      bot.attach(game);

      return bot;
    };

    game.onfinished = (winner) => {
      for (let bot of winner.players) {
        bot.wins++;
      }
    };

    game.onproceed = () => {
      return ++runs % iterations != 0;
    };

    await game.run();

    brain = elitism(game.players);
    callback(epoch);
  } while (++epoch < generations);

  return brain;
}

function elitism(bots) {
  let highest = 0, brain;
  for (let bot of bots) {
    if (bot.wins > highest) {
      brain = bot.brain;
      highest = bot.wins;
    }
  }

  return brain;
}

