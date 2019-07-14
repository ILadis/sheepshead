
import OS from 'os';
import Process from 'process';

import { Trainer } from '../trainer.mjs';
import { Brain } from './brain.mjs';

let brain = new Brain();

const options = {
  callback

  /* additional settings:
   *   runs: number of iterations for each generation,
   *   target: number of generations to evolve
   */
};

Process.stderr.write('Starting training');

function callback() {
  Process.stderr.write('.');
};

Trainer.train(brain, options).then((brain) => {
  Process.stderr.write(` Finished!${OS.EOL}`);

  let network = brain.serialize();
  let json = JSON.stringify(network);

  Process.stdout.write(json);
});

