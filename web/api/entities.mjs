
export function State(game) {
  this.game = game;
};

State.prototype.toJSON = function() {
  let id = this.game.id;
  let phase = this.game.phase.name;
  let player = this.game.actor;
  let actor = player ? new Player(player) : undefined;
  return { id, phase, actor };
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

export function Player(player, token) {
  this.player = player;
  this.token = token;
}

Player.prototype.toJSON = function() {
  let token = this.token;
  let name = this.player.name;
  let index = this.player.index;
  let points = this.player.points;
  let cards = this.player.cards.size;
  return { token, index, name, points, cards };
};

export function Card(card) {
  this.card = card;
}

Card.prototype.toJSON = function() {
  let suit = this.card.suit.description.toLowerCase();
  let rank = this.card.rank.description.toLowerCase();
  return { suit, rank };
};

