
export function Result(...players) {
  this.players = new Set(players);
  this.tricks = new Set();
}

Result.prototype.claim = function(trick) {
  this.tricks.add(trick);
};

Result.prototype.add = function(player) {
  let result = player.result;
  this.players.add(player);

  let iterator = result.tricks.values();
  for (let trick of iterator) {
    this.tricks.add(trick);
  }

  result.tricks.clear();
};

Result.prototype.points = function() {
  let iterator = this.tricks.values(), points = 0;
  for (let trick of iterator) {
    points += trick.points();
  }
  return points;
};

Result.prototype.matadors = function(trumps) {
  let cards = new Set();

  let iterator = this.tricks.values();
  for (let trick of iterator) {
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

