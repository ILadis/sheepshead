
export function State(game) {
  this.game = game;
};

State.prototype.toJSON = function() {
  let id = this.game.id;
  let state = this.game.phase;
  let phase = state ? state.name : undefined;
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

export function Result(result) {
  this.result = result;
};

Result.prototype.toJSON = function() {
  let owner = Array.from(this.result.players);
  let players = owner.map(p => new Player(p));
  let points = this.result.points;
  return { players, points };
};

export function Player(player, token) {
  this.player = player;
  this.token = token;
}

Player.prototype.toJSON = function() {
  let token = this.token;
  let name = this.player.name;
  let index = this.player.index;
  let cards = this.player.cards.size;
  return { token, index, name, cards };
};

export function Card(card) {
  this.card = card;
}

Card.prototype.toJSON = function() {
  let suit = this.card.suit.description.toLowerCase();
  let rank = this.card.rank.description.toLowerCase();
  return { suit, rank };
};

