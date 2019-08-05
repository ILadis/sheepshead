
export function Trick() {
  this.plays = new Map();
};

Trick.prototype.includes = function(player) {
  return this.plays.has(player);
};

Trick.prototype.play = function(player, card) {
  this.plays.set(player, card);
};

Trick.prototype.cards = function*() {
  let iterator = this.plays.values();
  for (let card of iterator) {
    yield card;
  }
};

Trick.prototype.points = function() {
  let iterator = this.plays.values(), points = 0;
  for (let card of iterator) {
    points += card.points();
  }
  return points;
};

Trick.prototype.lead = function() {
  let iterator = this.plays.values();
  let card = iterator.next().value;
  return card;
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

Trick.prototype[Symbol.iterator] = function*() {
  let iterator = this.plays.entries();
  for (let [player, card] of iterator) {
    yield { player, card };
  }
};

