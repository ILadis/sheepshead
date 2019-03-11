
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

  response.setHeader('Location', `/games/${id}`);
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
  let { game, url } = request;
  let events = game.events;

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
  var { game, entity, registry } = request;
  let id = game.id;
  let input = game.input

  let name = String(entity.name);
  if (!name.length) {
    response.writeHead(422);
    return response.end();
  }

  let player = new Player(name);
  let token = Token.generate();
  let index = player.index = input.args[0];

  registry.register(token, player);
  input.resolve(player);

  var entity = new Entities.Player(player, token);
  let json = JSON.stringify(entity);

  response.setHeader('Location', `/games/${id}/players?index=${index}`);
  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(201);
  response.write(json);
  return response.end();
});

Players.prototype['GET'] = Handlers.chain(
  PreFilters.requiresGame()
).then((request, response) => {
  let { game, url } = request;
  let players = game.players;

  let index = Number(url.query['index']);
  if (!Number.isNaN(index)) {
    players = players.filter(p => p.index == index);
  }

  let entity = players.map(p => new Entities.Player(p));
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
  let { game, player } = request;
  let contract = game.contract;
  let cards = Array.from(player.cards);

  let order = contract ? contract.order : new Order();
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
  PreFilters.requiresGame(),
).then((request, response) => {
  let entities = new Array();

  for (let [label, factory] of Contract) {
    switch (factory.length) {
    case 1:
      entities.push(new Entities.Contract({ label }));
      break;
    case 2:
      for (let suit of Suit) {
        entities.push(new Entities.Contract({ label, suit }));
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

export const Auction = Resource.create(
  ['POST'], '^/games/(?<id>\\d+)/auction$');

Auction.prototype['POST'] = Handlers.chain(
  PreFilters.requiresGame(Phases.auction),
  PreFilters.requiresPlayer(),
  PreFilters.requiresActor(),
  PreFilters.requiresEntity(JSON)
).then((request, response) => {
  let { game, player, entity } = request;
  let input = game.input;

  if (!entity.label && !entity.suit) {
    input.resolve();
    response.writeHead(200);
    return response.end();
  }

  let valueOf = (value) => String(value).toLowerCase();

  let factory = Contract[valueOf(entity.label)];
  let suit = Suit[valueOf(entity.suit)];

  if(!factory || factory.length == 2 && !suit) {
    response.writeHead(422);
    return response.end();
  }

  let contract = factory(player, suit);
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
  let { game, player, entity } = request;
  let input = game.input;

  let valueOf = (value) => String(value).toLowerCase();

  let rank = Rank[valueOf(entity.rank)];
  let suit = Suit[valueOf(entity.suit)];

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
  let { game } = request;
  let trick = game.trick;

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
  Auction,
  Hand,
  Trick
};

