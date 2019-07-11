
import * as Phases from '../../phases.mjs';
import { Tensor, Model, Indices, Inspector } from './utils.mjs';

import Neataptic from 'neataptic';

export function Brain() {
  this.actions = new Map();
  this.threshold = new Map();
  this.network = new Neataptic.architect.Perceptron(103, 60, 32);
};

Brain.fromJSON = function(json) {
  let network = Neataptic.Network.fromJSON(json);
  let brain = new Brain();
  brain.network = network;

  return brain;
};

Brain.toJSON = function(brain) {
  let json = brain.network.toJSON();
  return json;
};

Brain.prototype.ondealt = function(game, players) {
  this.actions.clear();

  for (let player of players) {
    this.actions.set(player, new Set());
  }
};

Brain.prototype.onsettled = function(game, contract) {
  this.threshold.clear();

  let players = game.players;
  let order = contract.order;

  for (let player of players) {
    let points = 0;
    for (let card of player.cards) {
      if (order.trumps.contains(card)) {
        points += 15;
      }
    }

    this.threshold.set(player, points);
  }
};

Brain.prototype.onturn = function(game, actor) {
  let { phase, trick, contract } = game;

  if (phase == Phases.playing) {
    let order = contract.order;
    let lead = trick.lead();
    let winner = trick.winner(order);

    let inspector = new Inspector(game);
    let cards = inspector.determinePlayedCards();
    let parties = inspector.determineParties();

    var tensor = new Tensor();
    let model = new Model(tensor);

    model.addCardStash(actor.cards);
    model.addCardStash(cards);
    model.addCardStash(trick.cards());
    model.addTrumpFlag(lead, order);
    model.addSuits(lead);
    model.addDeclarerFlag(parties, actor);
    model.addWinnerFlag(parties, winner, actor);
  }

  this.input = tensor;
};

Brain.prototype.onplayed = function(game, actor, card) {
  let input = this.input;
  let output = new Tensor();

  let states = output.append(Indices.cards.size());
  let index = Indices.cards.indexOf(card);
  states[index] = 1;

  states.commit();

  this.actions.get(actor).add({ input, output });
};

Brain.prototype.onbid = function() {
  return undefined;
};

Brain.prototype.onplay = function(game, actor, rules) {
  if (actor.brain == this) {
    let input = this.input;
    let output = this.network.activate(input.states);

    do {
      let highest = 0, index = 0;
      for (let i = 0; i < output.length; i++) {
        let value = output[i];
        if (value > highest) {
          highest = value;
          index = i;
        }
      }

      output[index] = 0;

      var card = Indices.cards.valueOf(index);
    } while (!rules.valid(card));

    return card;
  }
};

Brain.prototype.onfinished = function(game, winner, loser) {
  for (let result of [winner, loser]) {
    for (let player of result.players) {
      let points = this.threshold.get(player);
      let actions = this.actions.get(player);

      if (result.points() > points) {
        this.remember(actions);
      }
    }
  }
};

Brain.prototype.remember = function(actions) {
  for (let action of actions) {
    let { input, output } = action;

    this.network.activate(input.states, true);
    this.network.propagate(0.03, 0, true, output.states);
  }
}

