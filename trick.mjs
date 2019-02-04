
export function Trick() {
  this.plays = new Map();
  this.cards = new Set();
};

Trick.prototype.add = function(player, card) {
  this.plays.set(player, card);
  this.cards.add(card);
};

Trick.prototype.points = function() {
  let points = 0;
  for (let card of this.plays.values()) {
    points += card.points();
  }
  return points;
};

Trick.prototype.empty = function() {
  return this.plays.size <= 0;
};

