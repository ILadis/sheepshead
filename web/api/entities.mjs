
export function Game(game) {
  this.game = game;
};

Game.prototype.toJSON = function() {
  let id = this.game.id;
  let phase = this.game.phase.name;
  let players = `/games/${id}/players`;
  let actor = this.game.actor ? `/games/${id}/players?id=${this.game.actor.id}` : undefined;
  let cards = `/games/${id}/cards`;
  let trick = `/games/${id}/trick`;
  return { id, phase, _links: { players, actor, cards, trick } };
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
  this.card;
}

Card.prototype.toJSON = function() {
  let suit = this.card.suit.description.toLowerCase();
  let rank = this.card.rank.description.toLowerCase();
  return { suit, rank };
};

