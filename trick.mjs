
export function Trick() {
  this.plays = new Map();
};

Trick.prototype.add = function(player, card) {
  this.plays.set(player, card);
};

Trick.prototype.cards = function() {
  return Array.from(this.plays.values());
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

