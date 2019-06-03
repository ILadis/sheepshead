
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
  for (let card of this.cards) {
    points += card.points();
  }
  return points;
};

Trick.prototype.lead = function() {
  for (let card of this.cards) {
    return card;
  }
};

Trick.prototype.empty = function() {
  return this.cards.size == 0;
};

