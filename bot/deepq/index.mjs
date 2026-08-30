
import OS from 'os';
import Process from 'process';
import File from 'fs';
import Util from 'util';

import { Trainer } from './trainer.mjs';
import { Evaluator } from './evaluator.mjs';
import { DeepQNet, GreedyStrategy, ReplayMemory } from './deepq.mjs';

if (import.meta.main) {
  await main();
}

async function main() {
  let { values } = Util.parseArgs({ allowPositionals: true, options:
    {
      'evaluate':  { type: 'boolean' },
      'episodes':  { type: 'string'  },
      'baseline':  { type: 'string'  },
      'candidate': { type: 'string'  },
    }
  });

  let episodes = Number.parseInt(values.episodes) || 10e3;

  if (values.evaluate !== true) {
    await Trainer.train({
      // Function called after each simulation
      callback: every(1e3, stats(), save()),

      // Number of games to simulate
      episodes,

      // After 100 games evolution takes place
      evolve: 100,

      // Every game 200 experiences are learned from the replay memory
      memory:  ReplayMemory.forSteps(episodes * 32, 200),
      strat: GreedyStrategy.forSteps(episodes * 32, 0.01),

      network: new DeepQNet([190, 32, 32, 32, 32])
    });
  } else {
    await Evaluator.evaluate({
      // Function called after each simulation
      callback: every(1e2, results()),

      // Number of games to simulate
      episodes,

      // Baseline and candidate network to evaluate
      baseline:  load(values.baseline),
      candidate: load(values.candidate)
    });
  }
}

function load(path) {
  let json = File.readFileSync(path, { encoding: 'utf-8' });
  return JSON.parse(json);
}

function results() {
  let last = Date.now();
  return (stats) => {
    let now = new Date();
    let span = now.getTime() - last;

    Process.stdout.write(''
      + `Candidates won ${stats.wins} time(s) out `
      + `of ${stats.games} simulated game(s) `
      + `took ${span} ms [${now}]${OS.EOL}`);

    last = now.getTime();
  };
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
  return async (...args) => {
    if (++steps % count == 0) {
      for (let callback of callbacks) {
        await callback(...args, steps, count);
      }
    }
  };
}

