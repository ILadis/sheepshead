
import OS from 'os';
import Process from 'process';

import { Trainer } from './trainer.mjs';
import { Brain } from './brain.mjs';

const options = {
  // Function called after each simulation
  callback: every(100),

  // Number of games to simulate
  runs: 100000
};

Process.stderr.write('Starting training');

import('../../brains/network.json').then((network) => {
  let brain = new Brain();
  brain.deserialize(network.default);

  Process.stderr.write(' (loaded network from json)');

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

function every(count) {
  let runs = 0;
  return () => {
    if (++runs % count == 0) {
      Process.stderr.write('.');
    }
  };
};

