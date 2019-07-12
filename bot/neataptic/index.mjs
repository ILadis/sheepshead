
import OS from 'os';
import Process from 'process';

import { Brain } from './brain.mjs';
import * as Trainer from './trainer.mjs';

let brain = new Brain();

const options = {
  callback

  /* additional settings:
   *   iterations: number of iterations for each generation,
   *   generations: number of generations to evolve
   */
};

const name = `Brain Gen #${options.generations}`;

Process.stderr.write(''
  + `Starting training for '${name}':`
  + `${OS.EOL}`);

Trainer.train(brain, options).then((brain) => {
  let json = brain.serialize();
  json.name = name;

  Process.stdout.write(JSON.stringify(json));
});

function callback(epoch) {
  Process.stderr.write(''
    + `Currently at generation #${epoch} `
    + `of ${options.generations}`
    + `${OS.EOL}`);
};

