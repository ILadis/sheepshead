
import { Brain } from './brain.mjs';
import { bidder } from './trainer.mjs';
import { Game } from '../../game.mjs';
import { Bot } from '../bot.mjs';

export const Evaluator = Object.create(null);

Evaluator.evaluate = async function(options = {}) {
  let {
    episodes = 1000,
    callback = () => {},
    baseline, candidate,
  } = options;

  let game = new Game();
  let networks = new Array(baseline, baseline, candidate, candidate);
  let suspects = new Array();

  let stats = { games: 0, wins: 0 };
  let seats = [
    [1, 2, 4, 3],
    [1, 3, 2, 4],
    [1, 3, 4, 2],
    [1, 4, 2, 3],
    [1, 4, 3, 2],
  ];

  let rotate = Math.ceil(episodes / seats.length);

  game.onjoin = (index) => {
    let network = networks.shift();

    let brain = new Brain({ network });
    brain.onbid = bidder;

    let bot = new Bot(index, brain, 0);
    bot.attach(game);

    if (network == candidate) {
      suspects.push(bot);
    }

    for (let seat of seats) {
      let position = seat.indexOf(index);
      seat[position] = bot;
    }

    return bot;
  };

  game.onfinished = (winner, loser) => {
    let winners = suspects.every(p => winner.players.has(p));
    let loosers = suspects.every(p => loser.players.has(p));

    if (winners || loosers) {
      stats.games++;
      stats.wins += winners ? 1 : 0;
    }

    callback(stats);
  };

  game.onproceed = () => {
    let { players } = game;

    if (--episodes % rotate == 0) {
      let seat = seats.shift();
      players.splice(0, seat.length, ...seat);
    }

    return episodes > 0;
  };

  await game.run();

  return stats;
};

