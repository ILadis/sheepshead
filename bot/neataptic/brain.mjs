
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
    let state = this.state;
    let action = this.action;

    // TODO last turn won't save experience
    if (state && action) {
      let reward = this.reward || 0;
      let next = this.observe(game);

      let exp = { state, action, reward, next };
      this.memory.save(exp);
    }

    let sample = this.memory.sample(100);
    if (sample) {
      for (let exp of sample) {
        this.remember(exp);
      }
    }

    let evolve = this.step % 10 == 0;
    if (evolve) {
      this.target = this.policy.clone();
    }
  }
};

Brain.prototype.onplay = function(game, actor, rules) {
  if (actor.brain == this) {
    let state = this.observe(game);

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
      let parties = inspect.currentParties(player);
      let winner = inspect.victoriousParty(parties);

      var reward = trick.points() || 1;

      if (winner && winner.has(player)) {
        reward = +reward;
      } else {
        reward = -reward;
      }
    }
  }

  this.reward = reward;
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

Brain.prototype.observe = function(game) {
  let { actor, trick, contract } = game;

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

Brain.prototype.remember = function(exp) {
  let { state, action, reward, next } = exp;

  var output = this.target.activate(next);
  let max = output.reduce((p, v) => p > v ? p : v);

  let discount = 0.9;

  let value = reward + discount * max;
  let index = Indices.cards.indexOf(action);

  let rate = 0.001;
  let momentum = 0;

  output[index] = value;

  this.policy.activate(state, true);
  this.policy.propagate(rate, momentum, true, output);
};

Brain.prototype.clone = function() {
  let network = this.serialize();
  let brain = new Brain(network);
  return brain;
};

Brain.prototype.serialize = function() {
  return this.policy.serialize();
};

