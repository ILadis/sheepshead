
import OS from 'os';
import Process from 'process';

import { Brain } from './brain.mjs';
import * as Trainer from './trainer.mjs';

let brain = new Brain();
let limit = Number(Process.argv[2] || 10000);
let name = String(Process.argv[3] || `Brain #${limit}`);

Process.stderr.write(''
  + `Starting training for '${name}' with ${limit} iterations`
  + `${OS.EOL}`);

Trainer.train(brain, callback).then(() => {
  let json = brain.network.toJSON();
  json.name = name;

  Process.stdout.write(JSON.stringify(json));
});

function callback(iterations) {
  if (iterations % 1000 == 0) {
    Process.stderr.write(''
      + `Currently at ${iterations} iterations, `
      + `${limit - iterations} iterations left...`
      + `${OS.EOL}`);
  }

  return iterations < limit;
};

