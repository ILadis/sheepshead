
import { Game } from '../../game.mjs';
import { Contract } from '../../contract.mjs';
import { Bot } from '../bot.mjs';

export const Trainer = Object.create(null);

Trainer.train = async function(brain, options = {}) {
  let {
    episodes = 1000,
    callback = () => {}
  } = options;

  let game = new Game();

  game.onjoin = (index) => {
    let clone = brain.clone();
    clone.onbid = bidder;

    let bot = new Bot(index, clone);
    bot.thinktime = 0;

    bot.attach(game);

    return bot;
  };

  game.onproceed = () => {
    callback();
    return --episodes >= 0;
  };

  await game.run();

  return game.players[0].brain;
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

