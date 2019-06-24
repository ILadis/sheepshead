
export function Trick() {
  this.plays = new Map();
};

Trick.prototype.add = function(player, card) {
  this.plays.set(player, card);
};

Trick.prototype.cards = function() {
  return this.plays.values();
};

Trick.prototype.moveBy = function(card) {
  let iterator = this.plays.entries();
  for (let [player, c] of iterator) {
    if (card == c) {
      return player;
    }
  }
};

Trick.prototype.points = function() {
  let points = 0;
  for (let card of this.plays.values()) {
    points += card.points();
  }
  return points;
};

Trick.prototype.lead = function() {
  let iterator = this.plays.values();
  return iterator.next().value;
};

Trick.prototype.empty = function() {
  return this.plays.size == 0;
};

Trick.prototype.winner = function(order) {
  let winner, highest = 0;

  let iterator = this.plays.entries();
  for (let [player, card] of iterator) {
    let value = order.valueOf(card);

    if (value > highest) {
      winner = player;
      highest = value;
    }
  }

  return winner;
};

