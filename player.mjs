
export function Player(name) {
  this.name = name;
  this.points = 0;
  this.cards = new Array();
}

Player.prototype.toString = function() {
  return `${this.name}`;
};

Player.sequence = function(group, from) {
  let start = from ? group.findIndex(player => player == from) : 0;

  let next = function*() {
    let index = start;
    let count = group.length;

    while (count-- > 0) {
      yield group[index++ % group.length];
    }
  };

  return { [Symbol.iterator]: next };
};

