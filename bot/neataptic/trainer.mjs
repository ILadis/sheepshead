
import { Contract } from '../../contract.mjs';
import { Arena } from './arena.mjs';

export const Trainer = Object.create(null);

Trainer.train = async function(brain, options = {}) {
  let {
    runs = 1000,
    callback = () => {}
  } = options;

  let arena = new Arena();
  for (let index of [1, 2, 3, 4]) {
    let clone = brain.clone();
    clone.onbid = bidder(clone);

    arena.join(clone);
  }
  
  let result = await arena.compete(runs, callback);
  let fittest = elitism(result);

  return fittest.brain;
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
  let highest = 0, fittest;
  for (let bot of bots) {
    let wins = scores.totalOf(bot);

    if (wins > highest) {
      fittest = bot;
      highest = wins;
    }
  }

  return fittest;
}

