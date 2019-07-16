
import { Contract } from '../../contract.mjs';
import { Arena } from './arena.mjs';

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
      let clone = brain.clone();
      clone.onbid = bidder(clone);

      arena.join(clone);
    }

    let result = await arena.compete(runs);
    var brain = elitism(result);

    callback();
  } while (--target >= 0);

  return brain.clone();
};

function bidder(brain) {
  return (game, actor, rules) => {
    if (actor.brain != brain) {
      return undefined
    }

    let contracts = Array.from(Contract).filter(c => c.value == 1);
    let options = Array.from(rules.options(contracts));

    let index = Math.floor(Math.random() * options.length);
    let contract = options[index];

    return contract;
  };
}

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

