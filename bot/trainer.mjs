
import { Arena } from './arena.mjs';
import { Bot } from './bot.mjs';

export const Trainer = Object.create(null);

Trainer.train = async function(brain, options = {}) {
  let {
    runs = 1000,
    target = 10,
    callback = () => {}
  } = options;

  do {
    let arena = new Arena();
    for (let index of [1, 2, 3, 4]) {
      arena.join(brain.clone());
    }

    let result = await arena.compete(runs);
    var brain = elitism(result);

    callback();
  } while (--target >= 0);

  return brain;
};

function elitism({ scores, bots }) {
  let highest = 0, brain;
  for (let bot of bots) {
    let wins = scores.totalOf(bot);

    if (wins > highest) {
      brain = bot.brain;
      highest = wins;
    }
  }

  return brain;
}

