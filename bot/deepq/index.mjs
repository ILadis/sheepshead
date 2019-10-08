
import OS from 'os';
import Process from 'process';
import File from 'fs';
import { Trainer } from './trainer.mjs';
import { DeepQNet, GreedyStrategy, ReplayMemory } from './deepq.mjs';

const options = {
  // Function called after each simulation
  callback: every(1e3, stats(), save()),

  // Number of games to simulate
  episodes: 10e6,

  memory: new ReplayMemory(1000, 100),
  strat: new GreedyStrategy(1, 0.1, 0.0000004),
  network: new DeepQNet(134, 32, 32, 32, 32)
};

Trainer.train(options);

function stats() {
  let last = Date.now();
  return ({ steps, count }) => {
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
  return ({ network }) => {
    let name = `Snapshot Gen #${version}`;

    let json = network.serialize({ name });

    let file = `snapshot.json`;
    File.writeFileSync(file, json);

    version++;
  };
}

function every(count, ...callbacks) {
  let steps = 1;
  return (network) => {
    if (steps++ % count == 0) {
      let args = { steps, count, network };
      for (let callback of callbacks) {
        callback(args);
      }
    }
  };
}

