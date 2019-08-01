
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
    let exp = this.gainExperience(game, actor);
    this.memory.save(exp);
  }
};

Brain.prototype.onplay = function(game, actor, rules) {
  if (actor.brain == this) {
    let state = this.observe(game, actor);

    if (this.wantExplore()) {
      var card = this.actRandomly(actor, rules);
    } else {
      var card = this.actGreedy(state, rules);
    }

    this.state = state;
    this.action = card;

    return card;
  }
};

Brain.prototype.oncompleted = function(game) {
  for (let player of game.players) {
    if (player.brain == this) {
      let reward = this.gainReward(game, player);
      this.reward = reward;
      break;
    }
  }
};

Brain.prototype.onfinished = function(game) {
  for (let player of game.players) {
    if (player.brain == this) {
      let exp = this.gainExperience(game, player);
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

Brain.prototype.wantExplore = function() {
  let expls = this.expls || 0;

  let end = 0.1;
  let start = 1;
  let decay = 0.000021;

  let explore = end + (start - end) * Math.exp(-1 * expls * decay);
  let rand = Math.random();

  this.expls = expls + 1;

  return explore > rand;
};

Brain.prototype.actRandomly = function(player, rules) {
  let options = Array.from(rules.options(player.cards));
  let index = Math.floor(Math.random() * options.length);
  return options[index];
};

Brain.prototype.actGreedy = function(state, rules) {
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

Brain.prototype.observe = function(game, player) {
  let { trick, contract } = game;

  let order = contract.order;
  let lead = trick.lead();

  let cards = this.countCards(game);
  let winning = this.winning(game, player);

  let tensor = new Tensor();
  let builder = new Builder(tensor);

  builder.cards(player.cards)
    .cards(cards)
    .cards(trick.cards())
    .suits(lead)
    .flag(order.trumps.contains(lead))
    .flag(winning);

  return tensor.states;
};

Brain.prototype.countCards = function(game) {
  let { players } = game;

  let cards = new Set();
  for (let player of players) {
    for (let card of player.cards) {
      cards.add(card);
    }
  }

  return cards;
};

Brain.prototype.winning = function(game, player) {
  let { contract, trick, players } = game;

  let winner = trick.winner(contract.order);
  if (!winner) {
    return false;
  }

  let declarer = new Set();
  let { owner, partner } = contract;

  declarer.add(owner);

  if (players.includes(partner)) {
    declarer.add(partner);
  } else if (player.cards.contains(partner)) {
    declarer.add(partner = player);
  }

  if (!partner || declarer.has(partner)) {
    return declarer.has(winner) == declarer.has(player);
  }

  return winner == player;
};

Brain.prototype.gainExperience = function(game, player) {
  let state = this.state;
  let action = this.action;

  if (state && action) {
    let reward = this.reward || 0;
    let final = game.phase.name != 'playing';

    let next = this.observe(game, player);

    this.state = null;
    this.action = null;

    return new Experience({ state, action, reward, next, final });
  }
};

Brain.prototype.gainReward = function(game, player) {
  let { trick } = game;

  let won = this.winning(game, player);
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

