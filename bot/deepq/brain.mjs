
import { Tensor, Builder, Indices } from './model.mjs';
import { DeepQNet, ReplayMemory, GreedyStrategy } from './deepq.mjs';

export function Brain({ network, memory, strat }) {
  this.memory = memory || new ReplayMemory(1000, 100);
  this.strat = strat || new GreedyStrategy(1, 0.1, 0.0001);
  this.network = network || new DeepQNet(134, 64, 32);
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
    let state = this.observeState(game, actor);

    let explore = this.wantExplore();
    if (explore) {
      var card = this.actRandomly(actor, rules);
    } else {
      var card = this.actGreedy(state, rules);
    }

    let action = Indices.cards.indexOf(card);

    this.state = state;
    this.action = action;

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
};

Brain.prototype.actRandomly = function(player, rules) {
  let options = Array.from(rules.options(player.cards));
  let index = Math.floor(Math.random() * options.length);
  return options[index];
};

Brain.prototype.actGreedy = function(state, rules) {
  let output = this.network.predict(state);

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

Brain.prototype.observeState = function(game, actor) {
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
      var next = this.observeState(game, player);
    }

    this.state = null;
    this.action = null;

    let exp =  { state, action, reward, next };
    this.memory.save(exp);
  }
};

