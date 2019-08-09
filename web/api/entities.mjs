
export function Game(id, game) {
  this.id = id;
  this.game = game;
};

Game.prototype.toJSON = function() {
  let id = this.id;
  let phase = this.game.phase;
  phase = phase ? phase.name : undefined;
  let players = Array.from(this.game.players);
  players = players.map(p => p.name);
  return { id, phase, players };
};

export function Contract(contract) {
  this.contract = contract;
}

Contract.prototype.toJSON = function() {
  let name = this.contract.name;
  let variant = this.contract.variant;
  let owner = this.contract.owner;
  owner = owner ? new Player(owner) : undefined;
  return { name, variant, owner };
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
  let points = this.result.points();
  let score = this.result.score;
  return { players, points, score };
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
  let cards = Array.from(this.player.cards)
  cards = cards.length;
  return { token, actor, index, name, cards };
};

export function Score(player, score, total) {
  this.player = player;
  this.score = score;
  this.total = total;
}

Score.prototype.toJSON = function() {
  let name = this.player.name;
  let index = this.player.index;
  let score = this.score;
  let total = this.total;
  return { index, name, score, total };
};

export function Card(card) {
  this.card = card;
}

Card.prototype.toJSON = function() {
  let suit = this.card.suit.description.toLowerCase();
  let rank = this.card.rank.description.toLowerCase();
  return { suit, rank };
};

export function Chat(player, message) {
  this.player = player;
  this.message = message;
}

Chat.prototype.toJSON = function() {
  let player = new Player(this.player);
  let message = this.message;
  return { player, message };
};

