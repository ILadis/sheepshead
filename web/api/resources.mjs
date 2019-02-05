
import { Resource } from '../resource.mjs';
import { Handlers } from '../handlers.mjs';
import { Token } from '../token.mjs';
import { MediaType } from '../media-type.mjs';

import { PreFilters } from './prefilters.mjs';

import * as Phases from '../../phases.mjs';
import { Game } from '../../game.mjs';
import { Card } from '../../card.mjs';
import { Player } from '../../player.mjs';
import { Contract } from '../../contract.mjs';

// TODO implement better way to serialize JSON

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
  let self = State.link(id);

  request.registry.register(id, game);
  game.id = id;

  let json = JSON.stringify({
     id,
    _links: { self }
  });

  response.setHeader('Location', self);
  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(201);
  response.write(json);

  return response.end();
};

export const State = Resource.create(
  ['GET'], '^/games/(?<id>\\d+)$');

State.link = function(id) {
  return `/games/${id}`;
};

State.prototype['GET'] = Handlers.chain(
  PreFilters.requiresGame()
).then((request, response) => {
  let { game, registry } = request;

  let id = game.id;
  let state = game.phase.name;
  let players = Players.link(id);
  let index = game.players.indexOf(game.actor) + 1;
  let actor = game.actor ? Players.link(id, index) : undefined;
  let cards = Cards.link(id);
  let trick = Trick.link(id);
  let self = State.link(id);

  let json = JSON.stringify({
     id,
     state,
    _links: { players, actor, cards, trick, self }
  });

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(200);
  response.write(json);

  return response.end();
});

export const Events = Resource.create(
  ['GET'], '^/games/(?<id>\\d+)/events$');

Events.link = function(id) {
  return `/games/${id}/events`;
};

Events.prototype['GET'] = Handlers.chain(
  PreFilters.requiresGame()
).then((request, response) => {
  let { game } = request;

  response.setHeader('Content-Type', MediaType.event);
  response.writeHead(200);

  let id = game.id;

  game.register('onjoined', (...args) => {
    let player = args[0];
    let index = player.id;
    let name = player.name;
    let self = Players.link(id, index);

    let json = JSON.stringify({
       id: index,
       name,
      _links: { self }
    });

    response.write('event: onjoined\n');
    response.write(`data: ${json}\n\n`);
  });
  // TODO implement other event callbacks
});

export const Players = Resource.create(
  ['GET', 'POST'], '^/games/(?<id>\\d+)/players$');

Players.link = function(id, index) {
  let link = `/games/${id}/players`;
  if (index) {
    link += `?id=${index}`;
  }
  return link;
};

Players.prototype['POST'] = Handlers.chain(
  PreFilters.requiresGame(Phases.joining),
  PreFilters.requiresEntity(JSON)
).then((request, response) => {
  let { game, entity, registry } = request;

  let player = Player.withName(entity.name);
  if (!player) {
    response.writeHead(422);
    return response.end();
  }

  let id = game.id;
  let index = game.promise.args[0];
  let name = player.name;
  let token = Token.generate();
  let self = Players.link(id, index);

  registry.register(token, player);
  game.promise.resolve(player);
  player.id = index;

  let json = JSON.stringify({
     token,
     id: index,
     name,
    _links: { self }
  });

  response.setHeader('Location', self);
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

  let index = Number.parseInt(url.query['id']) - 1;
  let player = Number.isNaN(index) ? game.players : game.players[index];

  if (!player) {
    response.writeHead(404);
    return response.end();
  }

  let json = JSON.stringify(player, (key, value) => {
    if (key === 'cards') {
      return value.size;
    }
    return value;
  });

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(200);
  response.write(json);

  return response.end();
});

export const Cards = Resource.create(
  ['GET'], '^/games/(?<id>\\d+)/cards$');

Cards.link = function(id) {
  return `/games/${id}/cards`;
};

Cards.prototype['GET'] = Handlers.chain(
  PreFilters.requiresGame(),
  PreFilters.requiresPlayer()
).then((request, response) => {
  let { game, player } = request;

  let cards = Array.from(player.cards);
  let json = JSON.stringify(cards, (key, value) => {
    if (typeof value === 'symbol') {
      return value.description.toLowerCase();
    }
    return value;
  });

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(200);
  response.write(json);

  return response.end();
});

export const Trick = Resource.create(
  ['GET', 'POST'], '^/games/(?<id>\\d+)/trick$');

Trick.link = function(id) {
  return `/games/${id}/trick`;
};

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
  let json = JSON.stringify(cards, (key, value) => {
    if (typeof value === 'symbol') {
      return value.description.toLowerCase();
    }
    return value;
  });

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(200);
  response.write(json);

  return response.end();
});

