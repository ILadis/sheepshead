
import { Points } from './card.mjs';

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
    points += Points(card);
  }
  return points;
};

Trick.prototype.empty = function() {
  return this.plays.size <= 0;
};

Trick.prototype.size = function() {
  return this.plays.size;
};

Trick.prototype.winner = function(order) {
  let winner, highest = 0;

  for (let player of this.plays.keys()) {
    let card = this.plays.get(player);
    let value = order.valueOf(card);

    if (value >= highest) {
      winner = player;
      highest = value;
    }
  }

  return winner;
};

