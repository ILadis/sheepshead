
export function Scoreboard(players, tariff = 5) {
  this.tariff = tariff;
  this.scores = new Map();
  this.claims = new Map();

  for (let player of players) {
    this.scores.set(player, 0);
    this.claims.set(player, new Set());
  }
}

Scoreboard.prototype.scoreOf = function(player) {
  return this.scores.get(player);
};

Scoreboard.prototype.claim = function(player, trick) {
  this.claims.get(player).add(trick);
};

Scoreboard.prototype.award = function(result) {
  let { winner, loser } = result;

  for (let player of winner.players) {
    let score = this.scores.get(player);
    score += winner.score;

    this.scores.set(player, score);
    this.claims.get(player).clear();
  }

  for (let player of loser.players) {
    this.claims.get(player).clear();
  }
};

Scoreboard.prototype.result = function(contract) {
  if (this.claims.size == 0) {
    return null;
  }

  let declarer = new Result();
  let defender = new Result();

  let iterator = this.claims.entries();
  for (let [player, tricks] of iterator) {
    switch (player) {
    case contract.owner:
    case contract.partner:
      declarer.add(player, tricks);
      break;
    default:
      defender.add(player, tricks);
    }
  }

  let result = Result.compare(declarer, defender);

  let mult = multiplier(result, contract);
  let { winner, loser } = result;

  winner.score = this.tariff * mult;
  loser.score = 0;

  return result;
};

function multiplier(result, contract) {
  let { winner, loser } = result;
  let { partner, order: { trumps } } = contract;

  let multiplier = 1;

  if (!partner) {
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
}

export function Result() {
  this.players = new Set();
  this.tricks = new Set();
};

Result.prototype.add = function(player, tricks) {
  this.players.add(player);
  for (let trick of tricks) {
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
  let iterator = this.tricks.values();

  for (let trick of iterator) {
    for (let card of trick.cards()) {
      if (!trumps.contains(card)) {
        continue;
      }

      let player = trick.moveBy(card);
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

