
import { UID } from './uid.mjs';
import { Resource } from './resource.mjs';
import { MediaType } from './media-type.mjs';

import { Game } from '../game.mjs';
import { Card, Suits, Ranks } from '../card.mjs';
import { Player } from '../player.mjs';
import { Contract } from '../contract.mjs';

// TODO consider moving boilerplate to pre filter

export const Games = Resource.create(
  ['POST'], '^/games/?$');

Games.prototype['POST'] = async function(request, response) {
  let game = new Game();
  game.run();

  let guid = request.registry.register(game);
  var json = JSON.stringify({ guid });

  response.setHeader('Location', `/games/${guid}`);
  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(201);
  response.write(json);

  return response.end();
};

export const Join = Resource.create(
  ['POST'], `^/games/${UID}/join/?$`);

Join.prototype['POST'] = async function(request, response, path) {
  let guid = path[1];
  let game = request.registry.lookup(guid);
  if (!game) {
    response.writeHead(404);
    return response.end();
  }

  let phase = game.phase;
  if (phase.name != 'joining') {
    response.writeHead(400);
    return response.end();
  }

  var json = JSON.parse(await request.body);
  if (!json.name) {
    response.writeHead(422);
    return response.end();
  }

  let name = String(json.name);
  let player = new Player(name);
  let puid = request.registry.register(player);

  game.promise.resolve(player);

  var json = JSON.stringify({ puid, name });

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(201);
  response.write(json);

  return response.end();
};

export const State = Resource.create(
  ['GET'], `^/games/${UID}/state/?$`);

State.prototype['GET'] = async function(request, response, path) {
  let guid = path[1];
  let game = request.registry.lookup(guid);
  if (!game) {
    response.writeHead(404);
    return response.end();
  }

  let state = game.phase.name;
  let actor = game.actor ? game.actor.name : undefined;
  // TODO assign player unique number and return this here

  let json = JSON.stringify({ state, actor });

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(200);
  response.write(json);

  return response.end();
};

export const Cards = Resource.create(
  ['GET'], `^/games/${UID}/self/cards/?$`);

Cards.prototype['GET'] = async function(request, response, path) {
  let guid = path[1];
  let game = request.registry.lookup(guid);
  if (!game) {
    response.writeHead(404);
    return response.end();
  }

  if (!request.bearer) {
    response.setHeader('WWW-Authenticate', 'Bearer');
    response.writeHead(401);
    return response.end();
  }

  let puid = request.bearer;
  let player = request.registry.lookup(puid);
  if (!player || !game.players.includes(player)) {
    response.writeHead(403);
    return response.end();
  }

  let cards = Array.from(player.cards);
  let json = JSON.stringify(cards, (k, v) => {
    return typeof v == 'symbol' ? v.description.toLowerCase() : v;
  });

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(200);
  response.write(json);

  return response.end();
};

export const Bid = Resource.create(
  ['POST'], `^/games/${UID}/self/bid/?$`);

Bid.prototype['POST'] = async function(request, response, path) {
  let guid = path[1];
  let game = request.registry.lookup(guid);
  if (!game) {
    response.writeHead(404);
    return response.end();
  }

  if (!request.bearer) {
    response.setHeader('WWW-Authenticate', 'Bearer');
    response.writeHead(401);
    return response.end();
  }

  let puid = request.bearer;
  let player = request.registry.lookup(puid);
  if (!player || !game.players.includes(player)) {
    response.writeHead(403);
    return response.end();
  }

  let phase = game.phase;
  if (phase.name != 'auction' || game.actor != player) {
    response.writeHead(400);
    return response.end();
  }

  let body = await request.body;
  if (body.length) {
    let json = JSON.parse(body);
    if (!json.suit) {
      response.writeHead(422);
      return response.end();
    }

    let partner = Card.byName(json.suit, 'Ace');
    if (!partner) {
      response.writeHead(422);
      return response.end();
    }

    var contract = Contract.normal();
    contract.assign(player, partner);
  }

  game.promise.resolve(contract);

  response.writeHead(200);
  return response.end();
};

export const Play = Resource.create(
  ['POST'], `^/games/${UID}/self/play/?$`);

Play.prototype['POST'] = async function(request, response, path) {
  let guid = path[1];
  let game = request.registry.lookup(guid);
  if (!game) {
    response.writeHead(404);
    return response.end();
  }

  if (!request.bearer) {
    response.setHeader('WWW-Authenticate', 'Bearer');
    response.writeHead(401);
    return response.end();
  }

  let puid = request.bearer;
  let player = request.registry.lookup(puid);
  if (!player || !game.players.includes(player)) {
    response.writeHead(403);
    return response.end();
  }

  let phase = game.phase;
  if (phase.name != 'playing' || game.actor != player) {
    response.writeHead(400);
    return response.end();
  }

  let json = JSON.parse(await request.body);
  if (!json.suit || !json.rank) {
    response.writeHead(422);
    return response.end();
  }

  let card = Card.byName(json.suit, json.rank);
  if (!card) {
    response.writeHead(422);
    return response.end();
  }

  if (!player.draw(card)) {
    response.writeHead(400);
    return response.end();
  }

  game.promise.resolve(card);

  response.writeHead(200);
  return response.end();
};

