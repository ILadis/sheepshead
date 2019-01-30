
import { Resource } from '../resource.mjs';
import { Handlers } from '../handlers.mjs';
import { MediaType } from '../media-type.mjs';

import { Token } from './token.mjs';
import { Parser } from './parser.mjs';
import { PreFilters } from './prefilters.mjs';

import * as Phases from '../../phases.mjs';
import { Game } from '../../game.mjs';
import { Card } from '../../card.mjs';
import { Player } from '../../player.mjs';
import { Contract } from '../../contract.mjs';

// TODO implement JSON HAL

const Parsers = Object.create(null);

Parsers.player = Parser.compose()
  .string('name')
  .map(obj => new Player(obj.name));

Parsers.card = Parser.compose()
  .string('suit')
  .string('rank')
  .map(obj => Card.byName(obj.suit, obj.rank));

// TODO implement GET, should return links to resources
export const Games = Resource.create(
  ['POST'], '^/games$');

Games.prototype['POST'] = (request, response) => {
  let game = new Game();
  game.onbid = async (player) => {
    let partner = Player.across(game.players, player);
    let contract = Contract.normal(player, partner);
    return contract;
  };
  game.run();

  let id = 1;
  let href = `/games/${id}`;

  request.registry.register(id, game);

  let json = JSON.stringify({ id, href });

  response.setHeader('Location', href);
  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(201);
  response.write(json);

  return response.end();
};

export const State = Resource.create(
  ['GET'], '^/games/(?<id>\\d+)/state$');

State.prototype['GET'] = Handlers.chain(
  PreFilters.requiresGame()
).then((request, response) => {
  let game = request.game;

  let state = game.phase.name;
  let actor = game.actor ? game.actor.name : undefined;
  // TODO assign player unique number and return this here

  let json = JSON.stringify({ state, actor });

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(200);
  response.write(json);

  return response.end();
});

export const Players = Resource.create(
  ['GET', 'POST'], '^/games/(?<id>\\d+)/players$');

Players.prototype['POST'] = Handlers.chain(
  PreFilters.requiresGame(Phases.joining),
  PreFilters.requiresEntity(Parsers.player)
).then((request, response) => {
  let { game, entity } = request;

  let id = game.promise.args[0];
  let name = entity.name;
  let token = Token.generate();

  request.registry.register(token, entity);
  game.promise.resolve(entity);

  let json = JSON.stringify({ token, name, id });

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(201);
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
  let json = JSON.stringify(cards, (k, v) => {
    return typeof v == 'symbol' ? v.description.toLowerCase() : v;
  });

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
  PreFilters.requiresEntity(Parsers.card)
).then((request, response) => {
  let { game, player, entity } = request;

  // TODO use helper to verify requested play
  if (!player.draw(entity)) {
    response.writeHead(400);
    return response.end();
  }

  game.promise.resolve(entity);

  response.writeHead(200);
  return response.end();
});

