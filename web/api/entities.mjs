
export function State(game) {
  this.game = game;
};

State.prototype.toJSON = function() {
  let id = this.game.id;
  let phase = this.game.phase;
  phase = phase ? phase.name : undefined;
  let actor = this.game.actor;
  actor = actor ? new Player(actor) : undefined;
  return { id, phase, actor };
};

export function Contract(contract) {
  this.contract = contract;
}

Contract.prototype.toJSON = function() {
  let contract = this.contract;
  let name = contract ? contract.name : undefined;
  let variant = contract ? contract.variant : undefined;
  return { name, variant };
};

export function Play(player, card) {
  this.player = player;
  this.card = card;
}

Play.prototype.toJSON = function() {
  let player = new Player(this.player);
  let card = new Card(this.card);
  return { player, card };
};

export function Turn(player, phase) {
  this.player = player;
  this.phase = phase;
}

Turn.prototype.toJSON = function() {
  let player = new Player(this.player);
  let phase = this.phase.name;
  return { player, phase };
};

export function Result(result) {
  this.result = result;
};

Result.prototype.toJSON = function() {
  let players = Array.from(this.result.players);
  players = players.map(p => new Player(p));
  let points = this.result.points;
  return { players, points };
};

export function Player(player, actor, token) {
  this.player = player;
  this.actor = actor;
  this.token = token;
}

Player.prototype.toJSON = function() {
  let token = this.token;
  let actor = this.actor;
  let name = this.player.name;
  let index = this.player.index;
  let cards = this.player.cards.size;
  return { token, actor, index, name, cards };
};

export function Card(card) {
  this.card = card;
}

Card.prototype.toJSON = function() {
  let suit = this.card.suit.description.toLowerCase();
  let rank = this.card.rank.description.toLowerCase();
  return { suit, rank };
};

