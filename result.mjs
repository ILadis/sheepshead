
export function Result() {
  this.players = new Set();
  this.tricks = new Set();
}

Result.prototype.add = function(player) {
  this.players.add(player);
  for (let trick of player.tricks) {
    this.tricks.add(trick);
  }
};

Result.prototype.points = function() {
  let points = 0;

  for (let trick of this.tricks) {
    points += trick.points();
  }

  return points;
};

Result.prototype.matadors = function(trumps) {
  let cards = new Set();

  for (let trick of this.tricks) {
    for (let { player, card } of trick) {
      if (!trumps.contains(card)) {
        continue;
      }

      if (!this.players.has(player)) {
        continue;
      }

      cards.add(card);
    }
  }

  let order = Array.from(trumps).reverse();
  let count = 0;

  for (let card of order) {
    if (!cards.has(card)) {
      break;
    }
    count++;
  }

  return count;
};

Result.compare = function(result, other) {
  let winner = result, loser = other;
  if (other.points() >= result.points()) {
    winner = other;
    loser = result;
  }

  return { winner, loser };
};

Result.multiplier = function(result, contract) {
  let { winner, loser } = result;
  let { partner, order: { trumps } } = contract;

  let multiplier = 1;

  if (!partner && winner.players.size == 1) {
    multiplier += 3;
  }

  var matadors = winner.matadors(trumps);
  if (matadors >= 3) {
    multiplier += matadors;
  }

  var matadors = loser.matadors(trumps);
  if (matadors >= 3) {
    multiplier += matadors;
  }

  if (partner && loser.points() <= 30) {
    multiplier++;
  }

  if (partner && loser.points() == 0) {
    multiplier++;
  }

  return multiplier;
};

