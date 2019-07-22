
import { Inspector } from './inspector.mjs';
import { DeepQ } from './network.mjs';
import { Memory } from './memory.mjs';
import { Tensor, Builder, Indices } from './model.mjs';

export function Brain(network) {
  this.policy = network ? DeepQ.from(network) : new DeepQ(102, 60, 32);
  this.target = this.policy.clone();
  this.memory = new Memory(1000);
}

Brain.prototype.onbid = function() {
  return undefined;
};

Brain.prototype.onturn = function(game, actor) {
  if (actor.brain == this) {
    this.remember(game, actor);
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

    let options = new Set(rules.options(actor.cards));

    this.options = options;
    this.state = state;
    this.action = card;

    return card;
  }
};

Brain.prototype.oncompleted = function(game, trick) {
  let inspect = new Inspector(game);

  for (let player of game.players) {
    if (player.brain == this) {
      let parties = inspect.currentParties(player);
      let winner = inspect.victoriousParty(parties);

      var reward = trick.points() || 1;

      if (winner && winner.has(player)) {
        reward = +reward;
      } else {
        reward = -reward;
      }

      break;
    }
  }

  this.reward = reward;
};

Brain.prototype.onfinished = function(game) {
  for (let player of game.players) {
    if (player.brain == this) {
      this.remember(game, player, true);
      break;
    }
  }

  this.optimize();
  this.evolve();
};

Brain.prototype.explore = function() {
  let step = this.step || 0;

  let end = 0.1;
  let start = 1;
  let decay = 0.0001;

  let explore = end + (start - end) * Math.exp(-1 * step * decay);
  let rand = Math.random();

  this.step = step + 1;

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
  let winner = trick.winner(order);

  let inspect = new Inspector(game);

  let cards = inspect.playedCards();
  let parties = inspect.currentParties(actor);

  let tensor = new Tensor();
  let builder = new Builder(tensor);

  builder.cards(actor.cards)
    .cards(cards)
    .cards(trick.cards())
    .suits(lead)
    .trumpFlag(lead, order)
    .winnerFlag(parties, winner, actor);

  return tensor.states;
};

Brain.prototype.remember = function(game, actor, final = false) {
  let state = this.state;
  let action = this.action;

  if (state && action) {
    let options = this.options;
    let reward = this.reward || 0;
    let next = this.observe(game, actor);

    let exp = { state, action, options, reward, next, final };
    this.memory.save(exp);
  }

  this.state = null;
  this.action = null;
};

Brain.prototype.evolve = function() {
  let episodes = this.episodes || 0;

  let evolve = episodes % 10 == 0;
  if (evolve) {
    this.target = this.policy.clone();
  }

  this.episodes = episodes + 1;
};

Brain.prototype.optimize = function() {
  let sample = this.memory.sample(100) || [];

  for (let exp of sample) {
    let { state, action, options, reward, next, final } = exp;

    var output = this.target.activate(next);
    let max = 0;

    if (!final) {
      max = output.reduce((p, v) => p > v ? p : v);
    }

    let discount = 0.7;

    let value = reward + discount * max;
    let index = Indices.cards.indexOf(action);

    let rate = 0.001;
    let momentum = 0;

    output[index] = value;

    for (let i = 0; i < output.length; i++) {
      let card = Indices.cards.valueOf(i);
      if (!options.has(card)) {
        output[i] = 0;
      }
    }

    this.policy.activate(state, true);
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

