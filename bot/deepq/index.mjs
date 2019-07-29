
import File from 'fs';
import { Trainer } from './trainer.mjs';

const options = {
  // Function called after each simulation
  callback: every(10_000, save()),

  // Number of games to simulate
  episodes: 10_000_000
};

Trainer.train(options);


function save() {
  let version = 1;
  return ([brain]) => {
    let name = `Snapshot Gen #${version}`;

    let network = brain.serialize();
    network.name = name;

    let json = JSON.stringify(network);

    let file = `snapshot-${version}.json`;
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

