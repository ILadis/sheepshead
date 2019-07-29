
import { Inspector } from './inspector.mjs';
import { DeepQ } from './network.mjs';
import { Memory } from './memory.mjs';
import { Tensor, Builder, Indices } from './model.mjs';

export function Brain(network) {
  this.memory = new Memory(1000);
  this.policy = network ? DeepQ.from(network) : new DeepQ(102, 32, 32, 32, 32);
  this.target = this.policy.clone();
}

Brain.prototype.onbid = function() {
  return undefined;
};

Brain.prototype.onturn = function(game, actor) {
  if (actor.brain == this) {
    let exp = this.experience(game, actor);
    this.memory.save(exp);
  }
};

Brain.prototype.onplay = function(game, actor, rules) {
  if (actor.brain == this) {
    let state = this.observe(game, actor);

    if (this.explore()) {
      var card = this.randomly(actor, rules);
    } else {
      var card = this.greedy(state, rules);
    }

    this.state = state;
    this.action = card;

    return card;
  }
};

Brain.prototype.oncompleted = function(game, trick) {
  let inspect = new Inspector(game);

  for (let player of game.players) {
    if (player.brain == this) {
      let winner = inspect.isWinner(player);
      var reward = (winner ? +1 : -1) * (trick.points() || 1);
      break;
    }
  }

  this.reward = reward;
};

Brain.prototype.onfinished = function(game) {
  for (let player of game.players) {
    if (player.brain == this) {
      let exp = this.experience(game, player);
      this.memory.save(exp);
      break;
    }
  }

  let sample = this.memory.sample(100);
  if (sample) {
    this.optimize(sample);
    this.evolve();
  }
};

Brain.prototype.explore = function() {
  let expls = this.expls || 0;

  let end = 0.1;
  let start = 1;
  let decay = 0.000021;

  let explore = end + (start - end) * Math.exp(-1 * expls * decay);
  let rand = Math.random();

  this.expls = expls + 1;

  return explore > rand;
};

Brain.prototype.randomly = function(actor, rules) {
  let options = Array.from(rules.options(actor.cards));
  let index = Math.floor(Math.random() * options.length);
  return options[index];
};

Brain.prototype.greedy = function(state, rules) {
  let output = this.policy.activate(state);

  do {
    var highest = -Infinity, index = 0;
    for (let i = 0; i < output.length; i++) {
      if (output[i] > highest) {
        highest = output[i];
        index = i;
      }
    }

    output[index] = NaN;

    var card = Indices.cards.valueOf(index);
  } while (!rules.valid(card));

  return card;
};

Brain.prototype.observe = function(game, actor) {
  let { trick, contract } = game;

  let order = contract.order;
  let lead = trick.lead();

  let inspect = new Inspector(game);

  let tensor = new Tensor();
  let builder = new Builder(tensor);

  builder.cards(actor.cards)
    .cards(inspect.playedCards())
    .cards(trick.cards())
    .suits(lead)
    .flag(order.trumps.contains(lead))
    .flag(inspect.isWinner(actor));

  return tensor.states;
};

Brain.prototype.experience = function(game, actor) {
  let state = this.state;
  let action = this.action;

  if (state && action) {
    let reward = this.reward || 0;
    let final = game.phase.name != 'playing';
    let next = this.observe(game, actor);

    var exp = { state, action, reward, next, final };

    this.state = null;
    this.action = null;
  }

  return exp;
};

Brain.prototype.evolve = function() {
  let evols = this.evols || 0;

  let evolve = evols % 10 == 0;
  if (evolve) {
    this.target = this.policy.clone();
  }

  this.evols = evols + 1;
};

Brain.prototype.optimize = function(sample) {
  for (let exp of sample) {
    let { state, action, reward, next, final } = exp;

    let max = 0;

    if (!final) {
      let output = this.target.activate(next);
      max = output.reduce((p, v) => p > v ? p : v);
    }

    let discount = 0.7;

    let value = reward + discount * max;
    let index = Indices.cards.indexOf(action);

    let rate = 0.001;
    let momentum = 0;

    let output = this.policy.activate(state, true);
    output[index] = value;

    this.policy.propagate(rate, momentum, true, output);
  }
};

Brain.prototype.clone = function() {
  let network = this.serialize();
  return new Brain(network);
};

Brain.prototype.serialize = function() {
  return this.policy.serialize();
};

