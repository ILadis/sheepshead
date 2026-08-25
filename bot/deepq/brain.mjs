
import { Tensor, Builder, Indices } from './model.mjs';
import { DeepQNet, ReplayMemory, GreedyStrategy } from './deepq.mjs';
import { Ruleset } from '../../ruleset.mjs';

export function Brain({ network, memory, strat }) {
  this.memory = memory || new ReplayMemory(0, 0);
  this.strat = strat || new GreedyStrategy(0, 0, 0);
  this.network = network instanceof DeepQNet ? network : new DeepQNet(network || [222, 64, 32]);
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

Brain.prototype.onfinished = function(game, winner, loser) {
  for (let player of game.players) {
    if (player.brain == this) {
      this.gainFinalReward(player, winner);
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
    let highest = -Infinity, index = 0;
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

  let rules = Ruleset.forPlaying(game);
  let legal = rules.options(actor.cards);

  let [_, self] = this.playerAndPosition(game, p => p == actor);
  let [partner, fellow] = this.playerAndPosition(game, p => p != actor && party.has(p));
  let [foe, near] = this.playerAndPosition(game, p => !party.has(p));
  let [opponent, far] = this.playerAndPosition(game, p => p != foe && !party.has(p));

  let progress = actor.cards.size();

  let tensor = new Tensor();
  let builder = new Builder(tensor);

  builder.cards(actor.cards)
    .cards(partner.cards)
    .cards(foe.cards)
    .cards(opponent.cards);

  builder.cards(trick.cards())
    .suits(lead)
    .flag(order.trumps.contains(lead))
    .flag(party.has(winner));

  builder.position(self, 4)
    .position(fellow, 4)
    .position(near, 4)
    .position(far, 4)
    .progress(progress, 8, true);

  builder.cards(legal);

  return tensor.states;
};

Brain.prototype.playerAndPosition = function(game, filter) {
  let { sequence } = game;
  let position = 0;

  for (let player of sequence) {
    if (filter(player)) {
      return [player, position];
    }
    position++;
  }
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

Brain.prototype.gainFinalReward = function(player, winner) {
  let won = winner.players.has(player);
  let bonus = (won ? +1 : -1) * 50;

  this.reward = (this.reward || 0) + bonus;
};

Brain.prototype.gainExperience = function(game, player) {
  let state = this.state;
  let action = this.action;

  if (state && action >= 0) {
    let reward = this.reward || 0;
    let final = game.phase.name != 'playing';

    if (!final) {
      var next = this.observeState(game, player);
    }

    this.state = null;
    this.action = null;

    let exp = { state, action, reward, next };
    this.memory.save(exp);
  }
};

