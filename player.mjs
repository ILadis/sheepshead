
export function Player(name) {
  this.name = name;
  this.points = 0;
  this.cards = new Array();
}

Player.prototype.toString = function() {
  return `${this.name}`;
};

Player.sequence = function(group, from) {
  let index = from ? group.findIndex(player => player == from) : 0;
  let next = function() {
    return { value: group[index++ % group.length], done: false };
  };

  next[Symbol.iterator] = function() {
    return { next };
  };

  return next;
};

