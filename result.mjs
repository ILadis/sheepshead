
export function Result() {
  this.players = new Set();
  this.points = 0;
};

Result.compare = function(result, other) {
  let winner = result, loser = other;
  if (other.points >= result.points) {
    winner = other;
    loser = other;
  }

  return { winner, loser };
};

Result.prototype.add = function(player) {
  this.players.add(player);
  this.points += player.points;
};

