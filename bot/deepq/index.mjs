
import File from 'fs';
import { Trainer } from './trainer.mjs';
import { GreedyStrategy, ReplayMemory } from './deepq.mjs';

const options = {
  // Function called after each simulation
  callback: every(10e3, save()),

  // Number of games to simulate
  episodes: 10e6,

  memory: new ReplayMemory(1000, 100),
  strat: new GreedyStrategy(1, 0.1, 0.0000004)
};

Trainer.train(options);

function save() {
  let version = 1;
  return ([brain]) => {
    let name = `Snapshot Gen #${version}`;

    let network = brain.serialize();
    network.name = name;

    let json = JSON.stringify(network);

    let file = `snapshot.json`;
    File.writeFileSync(file, json);

    version++;
  };
}

function every(count, fn) {
  let steps = 1;
  return (...args) => {
    if (steps++ % count == 0) {
      fn(...args);
    }
  };
}

