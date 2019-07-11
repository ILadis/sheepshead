
import * as Trainer from './trainer.mjs';
import { Brain } from './brain.mjs';

let brain = new Brain();

Trainer.train(brain, 1000).then(() => {
  let json = Brain.toJSON(brain);
  console.log(JSON.stringify(json));
});

