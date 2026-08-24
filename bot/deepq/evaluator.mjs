
import { Brain } from './brain.mjs';
import { bidder } from './trainer.mjs';
import { Game } from '../../game.mjs';
import { Bot } from '../bot.mjs';

export function Evaluator() {
  this.networks = new Array();
}

Evaluator.prototype.add = function(...networks) {
  this.networks.push(...networks);

  while (this.networks.length > 4) {
    this.networks.shift();
  }
};

Evaluator.prototype.evaluate = async function(episodes) {
  let game = new Game();
  let networks = Array.from(this.networks);
  let stats = { games: 0 };

  if (networks.length < 4) {
    return false;
  }

  game.onjoin = (index) => {
    let network = networks.shift();

    let brain = new Brain({ network });
    brain.onbid = bidder;

    let bot = new Bot(index, brain, 0);
    bot.attach(game);

    stats[index] = { wins: 0 };

    return bot;
  };

  game.onproceed = () => --episodes > 0;
  game.onfinished = (winner, loser) => {
    stats.games++;

    for (let player of winner.players) {
      stats[player.index].wins++;
    }
  };

  await game.run();

  return stats;
};

