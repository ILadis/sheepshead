
import { Resource } from '../resource.mjs';
import { Handlers } from '../handlers.mjs';
import { Token } from '../token.mjs';
import { MediaType } from '../media-type.mjs';

import { PreFilters } from './prefilters.mjs';
import { EventStream } from './event-stream.mjs';
import { DeferredInput } from './deferred-input.mjs';
import * as Entities from './entities.mjs';

import { Game } from '../../game.mjs';
import { Card, Suit, Rank } from '../../card.mjs';
import { Player } from '../../player.mjs';
import { Contract } from '../../contract.mjs';
import { Order } from '../../order.mjs';
import * as Phases from '../../phases.mjs';

export const Games = Resource.create(
  ['POST'], '^/games$');

Games.prototype['POST'] = (request, response) => {
  let { registry } = request;
  let game = new Game();

  let events = new EventStream();
  events.attach(game);

  let input = new DeferredInput();
  input.attach(game);

  let id = registry.register(1, game);
  game.id = id;

  game.run();

  let entity = new Entities.State(game);
  let json = JSON.stringify(entity);

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(201);
  response.write(json);
  return response.end();
};

export const State = Resource.create(
  ['GET'], '^/games/(?<id>\\d+)$');

State.prototype['GET'] = Handlers.chain(
  PreFilters.requiresGame()
).then((request, response) => {
  let { game, registry } = request;

  let entity = new Entities.State(game);
  let json = JSON.stringify(entity);

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(200);
  response.write(json);
  return response.end();
});

export const Events = Resource.create(
  ['GET'], '^/games/(?<id>\\d+)/events$');

Events.prototype['GET'] = Handlers.chain(
  PreFilters.requiresGame()
).then((request, response) => {
  let { game: { events }, url } = request;

  let offset = Number(url.query['offset']);

  response.setHeader('Cache-Control', 'no-cache');
  response.setHeader('Content-Type', MediaType.event);
  response.writeHead(200);

  let callback = (event) => response.write(event);
  events.subscribe(callback, offset);

  request.on('close', () => {
    events.unsubscribe(callback);
    response.end();
  });
});

export const Players = Resource.create(
  ['GET', 'POST'], '^/games/(?<id>\\d+)/players$');

Players.prototype['POST'] = Handlers.chain(
  PreFilters.requiresGame(Phases.joining),
  PreFilters.requiresEntity(JSON)
).then((request, response) => {
  var { game: { input }, entity, registry } = request;

  let name = String(entity.name);
  if (!name.length) {
    response.writeHead(422);
    return response.end();
  }

  let token = Token.generate();
  let index = input.args[0];
  let player = new Player(name, index);

  registry.register(token, player);
  input.resolve(player);

  var entity = new Entities.Player(player, false, token);
  let json = JSON.stringify(entity);

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(201);
  response.write(json);
  return response.end();
});

Players.prototype['GET'] = Handlers.chain(
  PreFilters.requiresGame()
).then((request, response) => {
  let { game: { actor, players }, url } = request;

  let index = Number(url.query['index']);
  if (!Number.isNaN(index)) {
    players = players.filter(p => p.index == index);
  }

  let entity = players.map(p => new Entities.Player(p, p == actor));
  let json = JSON.stringify(entity);

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(200);
  response.write(json);
  return response.end();
});

export const Hand = Resource.create(
  ['GET'], '^/games/(?<id>\\d+)/cards$');

Hand.prototype['GET'] = Handlers.chain(
  PreFilters.requiresGame(),
  PreFilters.requiresPlayer()
).then((request, response) => {
  let { game: { contract }, player } = request;

  if (!contract) {
    contract = Contract['normal']['acorn'];
  }

  let cards = Array.from(player.cards);
  let order = contract.order;
  cards.sort((c1, c2) => order.orderOf(c2) - order.orderOf(c1));

  let entities = cards.map(c => new Entities.Card(c));
  let json = JSON.stringify(entities);

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(200);
  response.write(json);
  return response.end();
});

export const Contracts = Resource.create(
  ['GET'], '^/games/(?<id>\\d+)/contracts');

Contracts.prototype['GET'] = Handlers.chain(
  PreFilters.requiresGame(Phases.auction),
  PreFilters.requiresPlayer(),
  PreFilters.requiresActor()
).then((request, response) => {
  let { game: { input }, player } = request;

  let rules = input.args[1];
  let entities = new Array();

  for (let name in Contract) {
    for (let variant in Contract[name]) {
      let contract = Contract[name][variant];
      contract.assign(player);

      if (rules.isValid(contract)) {
        entities.push(new Entities.Contract(name, variant));
      }
    }
  }

  let json = JSON.stringify(entities);

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(200);
  response.write(json);
  return response.end();
});

export const Attendance = Resource.create(
  ['POST', 'DELETE'], '^/games/(?<id>\\d+)/auction/attend$');

Attendance.prototype['POST'] = Handlers.chain(
  PreFilters.requiresGame(Phases.attendance),
  PreFilters.requiresPlayer(),
  PreFilters.requiresActor()
).then((request, response) => {
  let { game: { input } } = request;

  input.resolve(true);

  response.writeHead(201);
  return response.end();
});

Attendance.prototype['DELETE'] = Handlers.chain(
  PreFilters.requiresGame(Phases.attendance),
  PreFilters.requiresPlayer(),
  PreFilters.requiresActor()
).then((request, response) => {
  let { game: { input } } = request;

  input.resolve(false);

  response.writeHead(204);
  return response.end();
});

export const Auction = Resource.create(
  ['POST'], '^/games/(?<id>\\d+)/auction$');

Auction.prototype['POST'] = Handlers.chain(
  PreFilters.requiresGame(Phases.auction),
  PreFilters.requiresPlayer(),
  PreFilters.requiresActor(),
  PreFilters.requiresEntity(JSON)
).then((request, response) => {
  let { game: { input }, player, entity } = request;

  var contract = Contract[entity.name];
  if (!contract) {
    response.writeHead(422);
    return response.end();
  }

  var contract = contract[entity.variant];
  if (!contract) {
    response.writeHead(422);
    return response.end();
  }
  contract.assign(player);

  let rules = input.args[1];
  if (!rules.isValid(contract)) {
    response.writeHead(400);
    return response.end();
  }

  input.resolve(contract);

  response.writeHead(200);
  return response.end();
});

export const Trick = Resource.create(
  ['GET', 'POST'], '^/games/(?<id>\\d+)/trick$');

Trick.prototype['POST'] = Handlers.chain(
  PreFilters.requiresGame(Phases.playing),
  PreFilters.requiresPlayer(),
  PreFilters.requiresActor(),
  PreFilters.requiresEntity(JSON)
).then((request, response) => {
  let { game: { input }, player, entity } = request;

  let rank = Rank[entity.rank];
  let suit = Suit[entity.suit];

  if (!suit || !rank) {
    response.writeHead(422);
    return response.end();
  }

  let card = Card[suit][rank];
  let rules = input.args[2];
  if (!rules.isValid(card)) {
    response.writeHead(400);
    return response.end();
  }

  input.resolve(card);

  response.writeHead(200);
  return response.end();
});

Trick.prototype['GET'] = Handlers.chain(
  PreFilters.requiresGame(Phases.playing)
).then((request, response) => {
  let { game: { trick } } = request;

  if (!trick) {
    response.writeHead(204);
    return response.end();
  }

  let cards = Array.from(trick.cards);

  let entities = cards.map(c => new Entities.Card(c));
  let json = JSON.stringify(entities);

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(200);
  response.write(json);
  return response.end();
});

export default {
  Games,
  State,
  Events,
  Players,
  Contracts,
  Attendance,
  Auction,
  Hand,
  Trick
};

