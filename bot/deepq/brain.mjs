
import { DeepQ } from './network.mjs';
import { Memory, Experience } from './memory.mjs';
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

Brain.prototype.oncompleted = function(game) {
  for (let player of game.players) {
    if (player.brain == this) {
      let reward = this.gather(game, player);
      this.reward = reward;
      break;
    }
  }
};

Brain.prototype.onfinished = function(game) {
  for (let player of game.players) {
    if (player.brain == this) {
      let exp = this.experience(game, player);
      this.memory.save(exp);
      break;
    }
  }

  let experiences = this.memory.sample(100);
  if (experiences) {
    this.optimize(experiences);
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
  let output = this.policy.noTraceActivate(state);

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

  let cards = this.count(game);
  let winning = this.winning(game, actor);

  let tensor = new Tensor();
  let builder = new Builder(tensor);

  builder.cards(actor.cards)
    .cards(cards)
    .cards(trick.cards())
    .suits(lead)
    .flag(order.trumps.contains(lead))
    .flag(winning);

  return tensor.states;
};

Brain.prototype.count = function(game) {
  let { players } = game;

  let cards = new Set();
  for (let player of players) {
    for (let card of player.cards) {
      cards.add(card);
    }
  }

  return cards;
};

Brain.prototype.winning = function(game, actor) {
  let { contract, trick, players } = game;

  let winner = trick.winner(contract.order);
  if (winner == actor) {
    return true;
  }

  let declarer = new Set();
  let { owner, partner } = contract;

  declarer.add(owner);

  if (players.includes(partner)) {
    declarer.add(partner);
  } else if (actor.cards.contains(partner)) {
    declarer.add(partner = actor);
  }

  if (!partner || declarer.has(partner)) {
    return declarer.has(winner) == declarer.has(actor);
  }
  
  return false;
};

Brain.prototype.experience = function(game, actor) {
  let state = this.state;
  let action = this.action;

  if (state && action) {
    let reward = this.reward || 0;
    let final = game.phase.name != 'playing';

    let next = this.observe(game, actor);

    var exp = new Experience({ state, action, reward, next, final });

    this.state = null;
    this.action = null;
  }

  return exp;
};

Brain.prototype.gather = function(game, actor) {
  let { trick } = game;

  let won = this.winning(game, actor);
  let points = trick.points() || 1;

  return (won ? +1 : -1) * points;
};

Brain.prototype.evolve = function() {
  let evols = this.evols || 0;

  let evolve = evols % 10 == 0;
  if (evolve) {
    this.target = this.policy.clone();
  }

  this.evols = evols + 1;
};

Brain.prototype.optimize = function(experiences) {
  for (let exp of experiences) {
    let { state, action, reward, next, final } = exp;

    let max = 0;
    if (!final) {
      let output = this.target.noTraceActivate(next);
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

Brain.prototype.serialize = function() {
  return this.policy.serialize();
};

