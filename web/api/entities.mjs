
export function Game(game) {
  this.game = game;
};

Game.prototype.toJSON = function() {
  let id = this.game.id;
  let phase = this.game.phase.name;
  let actor = this.game.actor ? this.game.actor.id : undefined;
  return { id, phase, actor };
};

export function Player(player, token) {
  this.player = player;
  this.token = token;
}

Player.prototype.toJSON = function() {
  let token = this.token;
  let id = this.player.id;
  let name = this.player.name;
  let cards = this.player.cards.size;
  return { token, id, name, cards };
};

export function Card(card) {
  this.card = card;
}

Card.prototype.toJSON = function() {
  let suit = this.card.suit.description.toLowerCase();
  let rank = this.card.rank.description.toLowerCase();
  return { suit, rank };
};

