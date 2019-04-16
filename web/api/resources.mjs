
import { Resource } from '../resource.mjs';
import { Token } from '../token.mjs';
import { MediaType } from '../media-type.mjs';

import { PreFilter } from './prefilter.mjs';
import { EventStream } from './event-stream.mjs';
import { DeferredInput } from './deferred-input.mjs';
import * as Entities from './entities.mjs';

import { Game } from '../../game.mjs';
import { Card, Suit, Rank } from '../../card.mjs';
import { Player } from '../../player.mjs';
import { Contract } from '../../contract.mjs';
import * as Phases from '../../phases.mjs';

const Resources = Object.create(null);

Resources.games = new Resource(
  ['GET', 'POST'], '/api/games');

Resources.games['GET'] = PreFilter.chain(
  PreFilter.requiresGames()
).then((request, response) => {
  let { games } = request;

  let entity = games.map(g => new Entities.State(g));
  let json = JSON.stringify(entity);

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(200);
  response.write(json);
  return response.end();
});

Resources.games['POST'] = PreFilter.chain(
  PreFilter.requiresGames()
).then((request, response) => {
  let { games, registry } = request;

  let game = new Game();
  games.push(game);

  let events = new EventStream();
  events.attach(game);

  let input = new DeferredInput();
  input.attach(game);

  let id = games.length;
  game.id = id;

  registry.register(id, game);
  game.run();

  let entity = new Entities.State(game);
  let json = JSON.stringify(entity);

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(201);
  response.write(json);
  return response.end();
});

Resources.state = new Resource(
  ['GET'], '/api/games/(?<id>\\d+)');

Resources.state['GET'] = PreFilter.chain(
  PreFilter.requiresGame()
).then((request, response) => {
  let { game } = request;

  let entity = new Entities.State(game);
  let json = JSON.stringify(entity);

  response.setHeader('Content-Type', MediaType.json);
  response.setHeader('Content-Length', Buffer.byteLength(json));
  response.writeHead(200);
  response.write(json);
  return response.end();
});

Resources.events = new Resource(
  ['GET'], '/api/games/(?<id>\\d+)/events');

Resources.events['GET'] = PreFilter.chain(
  PreFilter.requiresGame()
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

Resources.players = new Resource(
  ['GET', 'POST'], '/api/games/(?<id>\\d+)/players');

Resources.players['POST'] = PreFilter.chain(
  PreFilter.requiresGame(Phases.joining),
  PreFilter.requiresEntity(JSON)
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

Resources.players['GET'] = PreFilter.chain(
  PreFilter.requiresGame()
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

Resources.hand = new Resource(
  ['GET'], '/api/games/(?<id>\\d+)/cards');

Resources.hand['GET'] = PreFilter.chain(
  PreFilter.requiresGame(),
  PreFilter.requiresPlayer()
).then((request, response) => {
  let { game: { contract }, player } = request;

  if (!contract) {
    let variants = Contract.normal;
    contract = variants.acorn;
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

Resources.contracts = new Resource(
  ['GET'], '/api/games/(?<id>\\d+)/contracts');

Resources.contracts['GET'] = PreFilter.chain(
  PreFilter.requiresGame(Phases.attendance, Phases.bidding),
  PreFilter.requiresPlayer(),
  PreFilter.requiresActor()
).then((request, response) => {
  let { game: { input } } = request;

  let rules = input.args[1];
  let entities = new Array();

  for (let name in Contract) {
    for (let variant in Contract[name]) {
      let contract = Contract[name][variant];
      if (rules.isValid(contract)) {
        entities.push(new Entities.Contract(contract));
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

Resources.auction = new Resource(
  ['POST'], '/api/games/(?<id>\\d+)/auction');

Resources.auction['POST'] = PreFilter.chain(
  PreFilter.requiresGame(Phases.attendance, Phases.bidding),
  PreFilter.requiresPlayer(),
  PreFilter.requiresActor(),
  PreFilter.requiresEntity(JSON)
).then((request, response) => {
  let { game: { input }, entity } = request;

  if (!entity.name && !entity.variant) {
    input.resolve();
    response.writeHead(200);
    return response.end();
  }

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

  let rules = input.args[1];
  if (!rules.isValid(contract)) {
    response.writeHead(400);
    return response.end();
  }

  input.resolve(contract);

  response.writeHead(200);
  return response.end();
});

Resources.trick = new Resource(
  ['GET', 'POST'], '/api/games/(?<id>\\d+)/trick');

Resources.trick['POST'] = PreFilter.chain(
  PreFilter.requiresGame(Phases.playing),
  PreFilter.requiresPlayer(),
  PreFilter.requiresActor(),
  PreFilter.requiresEntity(JSON)
).then((request, response) => {
  let { game: { input }, entity } = request;

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

Resources.trick['GET'] = PreFilter.chain(
  PreFilter.requiresGame(Phases.playing)
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

export default Resources;

