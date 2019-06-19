
import { Resource } from '../resource.mjs';
import { MediaType } from '../media-type.mjs';

import { Token } from './token.mjs';
import { PreFilter } from './prefilter.mjs';
import { EventStream } from './event-stream.mjs';
import { DeferredInput } from './deferred-input.mjs';
import * as Entities from './entities.mjs';

import { Game } from '../../game.mjs';
import { Card, Suit, Rank } from '../../card.mjs';
import { Player } from '../../player.mjs';
import { Contract } from '../../contract.mjs';
import * as Phases from '../../phases.mjs';

import { Bot } from '../../bot/bot.mjs';
import { Brain } from '../../bot/neataptic/brain.mjs';
import * as Trainer from '../../bot/neataptic/trainer.mjs';

const Resources = Object.create(null);

Resources.games = new Resource(
  ['GET', 'POST'], '/api/games');

Resources.games['GET'] = (request, response) => {
  var { registry } = request;

  let games = registry.entries(e => e instanceof Game);
  let entities = new Array();
  for (let game of games) {
    let id = registry.lookup(game).id;
    entities.push(new Entities.Game(id, game));
  }
  let json = JSON.stringify(entities);

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(200);
  response.write(json);
  return response.end();
};

Resources.games['POST'] = (request, response) => {
  var { registry } = request;

  let game = new Game();
  let events = new EventStream();
  events.attach(game);

  let input = new DeferredInput();
  input.attach(game);

  let id = registry.register(game);
  registry.register({ id, input, events }, game);

  game.run();

  let entity = new Entities.Game(id, game);
  let json = JSON.stringify(entity);

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(201);
  response.write(json);
  return response.end();
};

Resources.state = new Resource(
  ['GET', 'DELETE'], '/api/games/(?<id>\\d+)');

Resources.state['GET'] = PreFilter.chain(
  PreFilter.requiresGame()
).then((request, response) => {
  var { game, registry } = request;

  let id = registry.lookup(game).id;

  let entity = new Entities.Game(id, game);
  let json = JSON.stringify(entity);

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(200);
  response.write(json);
  return response.end();
});

Resources.state['DELETE'] = PreFilter.chain(
  PreFilter.requiresGame(Phases.proceed),
  PreFilter.requiresPlayer()
).then((request, response) => {
  var { game, registry } = request;

  let { id, input } = registry.lookup(game);
  input.resolve(false);

  registry.unregister(id);
  registry.unregister(game);

  response.writeHead(204);
  return response.end();
});

Resources.events = new Resource(
  ['GET'], '/api/games/(?<id>\\d+)/events');

Resources.events['GET'] = PreFilter.chain(
  PreFilter.requiresGame()
).then((request, response) => {
  var { game, registry, url } = request;

  response.setHeader('Cache-Control', 'no-cache');
  response.setHeader('Content-Type', MediaType.event);
  response.writeHead(200);

  let offset = Number(url.query['offset']);
  let events = registry.lookup(game).events;

  let callback = (event) => response.write(event);
  events.subscribe(callback, offset);

  request.on('close', () => {
    events.unsubscribe(callback);
    response.end();
  });
});

Resources.players = new Resource(
  ['GET', 'POST'], '/api/games/(?<id>\\d+)/players');

Resources.players['POST'] = PreFilter.chain(
  PreFilter.requiresGame(Phases.joining),
  PreFilter.requiresEntity(JSON)
).then((request, response) => {
  var { game, registry, entity } = request;

  let input = registry.lookup(game).input;

  let token = Token.generate();
  let index = input.args[0];

  let player = new Player(entity.name, index);

  let rules = input.args[1];
  if (!rules.valid(player)) {
    response.writeHead(422);
    return response.end();
  }

  if (player.name == 'Bot') {
    let brain = new Brain();
    player = new Bot(index, brain);

    Trainer.train(brain, 100).then(() => {
      player.name += ' (trained)';
      player.attach(game);
    });
  }

  registry.register(player, token);
  context.input.resolve(player);

  var entity = new Entities.Player(player, false, 0, token);
  let json = JSON.stringify(entity);

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(201);
  response.write(json);
  return response.end();
});

Resources.players['GET'] = PreFilter.chain(
  PreFilter.requiresGame()
).then((request, response) => {
  var { game: { actor, players, scores }, url } = request;

  let index = Number(url.query['index']);
  var players = Array.from(players);
  if (!Number.isNaN(index)) {
    players = players.filter(p => p.index == index);
  }

  let score = (p) => scores.scoreOf(p);
  players.sort((p1, p2) => score(p2) - score(p1));

  let entity = players.map(p => new Entities.Player(p, p == actor, score(p)));
  let json = JSON.stringify(entity);

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(200);
  response.write(json);
  return response.end();
});

Resources.hand = new Resource(
  ['GET'], '/api/games/(?<id>\\d+)/cards');

Resources.hand['GET'] = PreFilter.chain(
  PreFilter.requiresGame(),
  PreFilter.requiresPlayer()
).then((request, response) => {
  var { game: { phase, contract }, player } = request;

  if (phase != Phases.playing) {
    let variants = Contract.normal;
    contract = variants.acorn;
  }

  let order = contract.order;
  let cards = Array.from(player.cards);
  cards.sort((c1, c2) => order.orderOf(c2) - order.orderOf(c1));

  let entities = cards.map(c => new Entities.Card(c));
  let json = JSON.stringify(entities);

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(200);
  response.write(json);
  return response.end();
});

Resources.contracts = new Resource(
  ['GET'], '/api/games/(?<id>\\d+)/contracts');

Resources.contracts['GET'] = PreFilter.chain(
  PreFilter.requiresGame(Phases.attendance, Phases.bidding),
  PreFilter.requiresPlayer(),
  PreFilter.requiresActor()
).then((request, response) => {
  var { game, registry } = request;

  let input = registry.lookup(game).input;
  let rules = input.args[1];
  let options = Array.from(rules.options(Contract));

  let entities = options.map(c => new Entities.Contract(c));
  let json = JSON.stringify(entities);

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(200);
  response.write(json);
  return response.end();
});

Resources.auction = new Resource(
  ['POST'], '/api/games/(?<id>\\d+)/auction');

Resources.auction['POST'] = PreFilter.chain(
  PreFilter.requiresGame(Phases.attendance, Phases.bidding),
  PreFilter.requiresPlayer(),
  PreFilter.requiresActor(),
  PreFilter.requiresEntity(JSON)
).then((request, response) => {
  var { game, registry, entity } = request;

  let input = registry.lookup(game).input;

  if (!entity) {
    input.resolve();
    response.writeHead(200);
    return response.end();
  }

  let variants = Contract[entity.name];
  if (!variants) {
    response.writeHead(422);
    return response.end();
  }

  let contract = variants[entity.variant];
  if (!contract) {
    response.writeHead(422);
    return response.end();
  }

  let rules = input.args[1];
  if (!rules.valid(contract)) {
    response.writeHead(400);
    return response.end();
  }

  input.resolve(contract);

  response.writeHead(200);
  return response.end();
});

Resources.trick = new Resource(
  ['POST'], '/api/games/(?<id>\\d+)/trick');

Resources.trick['POST'] = PreFilter.chain(
  PreFilter.requiresGame(Phases.playing),
  PreFilter.requiresPlayer(),
  PreFilter.requiresActor(),
  PreFilter.requiresEntity(JSON)
).then((request, response) => {
  var { game, registry, entity } = request;

  let rank = Rank[entity.rank];
  let suit = Suit[entity.suit];

  if (!suit || !rank) {
    response.writeHead(422);
    return response.end();
  }

  let card = Card[suit][rank];

  let input = registry.lookup(game).input;
  let rules = input.args[1];
  if (!rules.valid(card)) {
    response.writeHead(400);
    return response.end();
  }

  input.resolve(card);

  response.writeHead(200);
  return response.end();
});

export default Resources;

