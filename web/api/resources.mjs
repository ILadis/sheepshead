
import { Resource } from '../resource.mjs';
import { Handlers } from '../handlers.mjs';
import { Token } from '../token.mjs';
import { MediaType } from '../media-type.mjs';

import { PreFilters } from './prefilters.mjs';
import * as Entities from './entities.mjs';

import * as Phases from '../../phases.mjs';
import { Game } from '../../game.mjs';
import { Card } from '../../card.mjs';
import { Player } from '../../player.mjs';
import { Contract } from '../../contract.mjs';

export const Games = Resource.create(
  ['POST'], '^/games$');

Games.prototype['POST'] = (request, response) => {
  let game = new Game();

  game.onbid = async (player) => {
    let partner = Player.across(game.players, player);
    let contract = Contract.normal(player, partner);
    return contract;
  };

  game.onjoin =
  game.onplay = function(...args) {
    return new Promise((resolve, reject) => {
      this.promise = { args, resolve, reject };
    });
  };

  game.run();

  let id = 1;
  game.id = id;

  request.registry.register(id, game);

  let entity = new Entities.Game(game);
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

  let entity = new Entities.Game(game);
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
  let { game } = request;

  response.setHeader('Content-Type', MediaType.event);
  response.writeHead(200);

  let id = game.id;

  game.register('onjoined', (...args) => {
    let player = args[0];

    let entity = new Entities.Player(player);
    let json = JSON.stringify(entity);

    response.write('event: onjoined\n');
    response.write(`data: ${json}\n\n`);
  });
  // TODO implement other event callbacks
});

export const Players = Resource.create(
  ['GET', 'POST'], '^/games/(?<id>\\d+)/players$');

Players.prototype['POST'] = Handlers.chain(
  PreFilters.requiresGame(Phases.joining),
  PreFilters.requiresEntity(JSON)
).then((request, response) => {
  var { game, entity, registry } = request;

  let player = Player.withName(entity.name);
  if (!player) {
    response.writeHead(422);
    return response.end();
  }

  let id = game.promise.args[0];
  player.id = id;

  let token = Token.generate();

  registry.register(token, player);
  game.promise.resolve(player);

  var entity = new Entities.Player(player, token);
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
  let { game, url } = request;

  let id = Number.parseInt(url.query['id']);
  let players = game.players;

  if (!Number.isNaN(id)) {
    players = players.filter(p => p.id == id);
  }

  let entity = players.map(p => new Entities.Player(p));
  let json = JSON.stringify(entity);

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(200);
  response.write(json);

  return response.end();
});

export const Cards = Resource.create(
  ['GET'], '^/games/(?<id>\\d+)/cards$');

Cards.prototype['GET'] = Handlers.chain(
  PreFilters.requiresGame(),
  PreFilters.requiresPlayer()
).then((request, response) => {
  let { game, player } = request;

  let cards = Array.from(player.cards);

  let entities = cards.map(c => new Entities.Card(c));
  let json = JSON.stringify(entities);

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(200);
  response.write(json);

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

  let card = Card.byName(entity.suit, entity.rank);
  if (!card) {
    response.writeHead(422);
    return response.end();
  }

  // TODO use helper to verify requested play
  if (!player.draw(card)) {
    response.writeHead(400);
    return response.end();
  }

  game.promise.resolve(card);

  response.writeHead(200);
  return response.end();
});

Trick.prototype['GET'] = Handlers.chain(
  PreFilters.requiresGame(Phases.playing)
).then((request, response) => {
  let { game } = request;

  let cards = Array.from(game.trick.cards);

  let entities = cards.map(c => new Entities.Card(c));
  let json = JSON.stringify(entities);

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(200);
  response.write(json);

  return response.end();
});

