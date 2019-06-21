
export function Scoreboard(players, tariff = 5) {
  this.tariff = tariff;
  this.scores = new Map();
  this.claims = new Map();

  for (let player of players) {
    this.scores.set(player, 0);
    this.claims.set(player, new Set());
  }
}

Scoreboard.prototype.claim = function(player, trick) {
  this.claims.get(player).add(trick);
};

Scoreboard.prototype.score = function(result) {
  let { winner, loser } = result;

  for (let player of winner.players) {
    let score = this.scores.get(player);
    score += result.score;

    this.scores.set(player, score);
    this.claims.get(player).clear();
  }

  for (let player of loser.players) {
    this.claims.get(player).clear();
  }
};

Scoreboard.prototype.result = function(contract) {
  if (!contract) {
    return null;
  }

  let declarer = new Result();
  let defender = new Result();

  for (let [player, tricks] of this.claims) {
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

  let mult = multiplier(result);
  let { winner, loser } = result;

  winner.score = this.tariff * mult;
  loser.score = 0;

  return result;
};

function multiplier(result) {
  let { loser } = result;
  let multiplier = 1;

  if (loser.points() <= 30) {
    multiplier++;
  }

  if (loser.points() == 0) {
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

Result.compare = function(result, other) {
  let winner = result, loser = other;
  if (other.points() >= result.points()) {
    winner = other;
    loser = other;
  }

  return { winner, loser };
};

