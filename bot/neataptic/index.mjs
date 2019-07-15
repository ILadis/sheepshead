
import OS from 'os';
import Process from 'process';

import { Trainer } from './trainer.mjs';
import { Brain } from './brain.mjs';

const options = {
  // Function called after each new generation
  callback,

  // Number of iterations for each generation
  runs: 1000,
  // Number of generations to evolve
  target: 500
};

Process.stderr.write('Starting training');

function callback() {
  Process.stderr.write('.');
};

import('../../brains/network.json').then((network) => {
  let brain = new Brain();
  brain.deserialize(network.default);

  return brain;
}, () => {
  return new Brain();
}).then((brain) => {
  return Trainer.train(brain, options)
}).then((brain) => {
  Process.stderr.write(` Finished!${OS.EOL}`);

  let network = brain.serialize();
  let json = JSON.stringify(network);

  Process.stdout.write(json);
});

