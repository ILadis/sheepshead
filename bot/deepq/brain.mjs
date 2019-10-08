
import { Tensor, Builder, Indices } from './model.mjs';
import { Network, ReplayMemory, GreedyStrategy } from './deepq.mjs';

export function Brain({ network, memory, strat }) {
  this.memory = memory || new ReplayMemory(1000, 100);
  this.strat = strat || new GreedyStrategy(1, 0.1, 0.0001);
  this.policy = network ? Network.from(network) : new Network(134, 32, 32, 32, 32);
  this.target = this.policy.clone();
}

Brain.prototype.onbid = function() {
  return undefined;
};

Brain.prototype.onturn = function(game, actor) {
  if (actor.brain == this) {
    this.gainExperience(game, actor);
  }
};

Brain.prototype.onplay = function(game, actor, rules) {
  if (actor.brain == this) {
    let state = this.observe(game, actor);

    let explore = this.wantExplore();
    if (explore) {
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
      this.gainReward(game, player);
      break;
    }
  }
};

Brain.prototype.onfinished = function(game) {
  for (let player of game.players) {
    if (player.brain == this) {
      this.gainExperience(game, player);
      break;
    }
  }

  let experiences = this.memory.sample();
  if (experiences) {
    this.optimize(experiences);
  }
};

Brain.prototype.actRandomly = function(player, rules) {
  let options = Array.from(rules.options(player.cards));
  let index = Math.floor(Math.random() * options.length);
  return options[index];
};

Brain.prototype.actGreedy = function(state, rules) {
  let output = this.policy.predict(state);

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
  let { trick, contract: { order } } = game;

  let lead = trick.lead();
  let winner = trick.winner(order);

  let party = this.determineParty(game, actor);

  let partner = this.yetToBePlayed(game, actor, p => party.has(p));
  let opponents = this.yetToBePlayed(game, actor, p => !party.has(p));

  let tensor = new Tensor();
  let builder = new Builder(tensor);

  builder.cards(actor.cards)
    .cards(partner)
    .cards(opponents);

  builder.cards(trick.cards())
    .suits(lead)
    .flag(order.trumps.contains(lead))
    .flag(party.has(winner));

  return tensor.states;
};

Brain.prototype.determineParty = function(game, actor) {
  let { contract: { owner, partner }, players } = game;

  let declarer = new Set();
  let defender = new Set();

  for (let player of players) {
    if (player.cards.contains(partner)) {
      partner = player;
    }

    switch (player) {
    case owner:
    case partner:
      declarer.add(player);
      break;
    default:
      defender.add(player);
    }
  }

  return declarer.has(actor) ? declarer : defender;
};

Brain.prototype.yetToBePlayed = function(game, actor, filter) {
  let { players, trick } = game;

  let cards = new Set();
  for (let player of players) {
    if (player != actor && !trick.includes(player) && filter(player)) {
      for (let card of player.cards) {
        cards.add(card);
      }
    }
  }

  return cards;
};

Brain.prototype.wantExplore = function() {
  return this.strat.wantExplore();
};

Brain.prototype.gainReward = function(game, player) {
  let { trick, contract: { order } } = game;

  let party = this.determineParty(game, player);

  let winner = trick.winner(order);
  let points = trick.points() || 1;
  let won = party.has(winner);

  let reward = (won ? +1 : -1) * points;
  this.reward = reward;
};

Brain.prototype.gainExperience = function(game, player) {
  let state = this.state;
  let action = this.action;

  if (state && action) {
    let reward = this.reward || 0;
    let final = game.phase.name != 'playing';

    if (!final) {
      var next = this.observe(game, player);
    }

    this.state = null;
    this.action = null;

    let exp =  { state, action, reward, next };
    this.memory.save(exp);
  }
};

Brain.prototype.optimize = function(experiences) {
  let steps = this.iterations || 0;
  let evolve = ++steps % 10 == 0;

  if (evolve) {
    this.target = this.policy.clone();
  }

  for (let exp of experiences) {
    let { state, action, reward, next } = exp;

    let max = 0;
    if (next) {
      let output = this.target.predict(next);
      max = output.reduce((p, v) => p > v ? p : v);
    }

    let discount = 0.7;

    let value = reward + discount * max;
    let index = Indices.cards.indexOf(action);

    let rate = 0.001;
    let momentum = 0;

    let output = this.policy.activate(state);
    output[index] = value;

    this.policy.propagate(rate, momentum, output);
  }

  this.iterations = steps;
};

Brain.prototype.serialize = function() {
  return this.policy.serialize();
};

