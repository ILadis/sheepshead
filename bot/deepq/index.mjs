
import OS from 'os';
import Process from 'process';
import File from 'fs';
import Util from 'util';

import { Trainer } from './trainer.mjs';
import { Evaluator } from './evaluator.mjs';
import { DeepQNet, GreedyStrategy, ReplayMemory } from './deepq.mjs';

const options = {
  // Function called after each simulation
  callback: every(1e3, stats(), save()),

  // Number of games to simulate
  episodes: 10e6,

  // After 100 games evolution takes place
  evolutions: 100,

  // Every game 100 experiences are learned from the replay memory
  memory:  ReplayMemory.forSteps(10e6 * 32,  100),
  strat: GreedyStrategy.forSteps(10e6 * 32, 0.01),

  network: new DeepQNet([222, 32, 32, 32, 32])
};

if (import.meta.main) {
  await main();
}

async function main() {
  let { values } = Util.parseArgs({ allowPositionals: true, options:
    {
      'evaluate': { type: 'boolean' },
      'episodes': { type: 'string' },
      'network':  { type: 'string', multiple: true },
    }
   });

  if (values.evaluate !== true) {
    return Trainer.train(options);
  }

  let evaluator = new Evaluator();
  let episodes = Number.parseInt(values.episodes);

  while (values.network.length > 0) {
    let path = values.network.shift();
    let json = File.readFileSync(path, { encoding: 'utf-8' });

    let network = JSON.parse(json);
    evaluator.add(network);
  }

  let stats = await evaluator.evaluate(episodes || 1000);

  if (stats) {
    Process.stdout.write(`Evaluation simulated ${stats.games} game(s):${OS.EOL}`);
    for (let index = 1; index <= 4; index++) {
      Process.stdout.write(`- Bot ${index}: ${stats[index].wins} game(s) won${OS.EOL}`);
    }
  }
}

function stats() {
  let last = Date.now();
  return (network, steps, count) => {
    let now = new Date();
    let span = now.getTime() - last;

    Process.stdout.write(''
      + `Currently at ${steps} steps, last ${count} steps `
      + `took ${span} ms [${now}]${OS.EOL}`);

    last = now.getTime();
  };
}

function save() {
  let version = 1;
  return (network) => {
    let name = `Snapshot Gen #${version}`;

    let json = network.serialize({ name });

    let file = `snapshot.json`;
    File.writeFileSync(file, json);

    version++;
  };
}

function every(count, ...callbacks) {
  let steps = 0;
  return async (network) => {
    if (++steps % count == 0) {
      for (let callback of callbacks) {
        await callback(network, steps, count);
      }
    }
  };
}

