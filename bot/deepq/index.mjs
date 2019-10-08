
import OS from 'os';
import Process from 'process';
import File from 'fs';
import { Trainer } from './trainer.mjs';
import { GreedyStrategy, ReplayMemory } from './deepq.mjs';

const options = {
  // Function called after each simulation
  callback: every(10e3, stats(), save()),

  // Number of games to simulate
  episodes: 10e6,

  memory: new ReplayMemory(1000, 100),
  strat: new GreedyStrategy(1, 0.1, 0.0000004)
};

Trainer.train(options);

function stats() {
  let last = Date.now();
  return ({ steps, count }) => {
    let now = Date.now();
    let span = now - last;

    Process.stdout.write(''
      + `Currently at ${steps} steps, last ${count} steps took ${span} ms`
      + OS.EOL);

    last = now;
  };
}

function save() {
  let version = 1;
  return ({ brains }) => {
    let name = `Snapshot Gen #${version}`;

    let network = brains[0].serialize();
    network.name = name;

    let json = JSON.stringify(network);

    let file = `snapshot.json`;
    File.writeFileSync(file, json);

    version++;
  };
}

function every(count, ...callbacks) {
  let steps = 1;
  return (brains) => {
    if (steps++ % count == 0) {
      let args = { steps, count, brains };
      for (let callback of callbacks) {
        callback(args);
      }
    }
  };
}

