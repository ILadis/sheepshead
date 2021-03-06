
import { Game } from '../../game.mjs';
import { Contract } from '../../contract.mjs';
import { Bot } from '../bot.mjs';
import { Brain } from './brain.mjs';

export const Trainer = Object.create(null);

Trainer.train = async function(options = {}) {
  let {
    episodes = 1000,
    evolutions = 10,
    callback = () => {},
    memory = null,
    strat = null,
    network = null
  } = options;

  let game = new Game();
  let brains = new Array();

  game.onjoin = (index) => {
    let brain = new Brain({ memory, strat, network });
    brain.onbid = bidder;

    brains.push(brain);

    let bot = new Bot(index, brain);
    bot.thinktime = 0;

    bot.attach(game);

    return bot;
  };

  game.onproceed = () => {
    let experiences = memory.sample();
    if (experiences) {
      network.optimize(experiences);
    }

    if (episodes % evolutions == 0) {
      network.evolve();
    }

    callback(network);
    return --episodes >= 0;
  };

  await game.run();

  return brains;
};

function bidder(game, actor, rules) {
  if (actor.brain != this) {
    return undefined
  }

  let contracts = Array.from(Contract).filter(c => c.value == 1);
  let options = Array.from(rules.options(contracts));

  let index = Math.floor(Math.random() * options.length);
  let contract = options[index];

  return contract;
}

