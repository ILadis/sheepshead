
export function Player(name) {
  this.name = name;
  this.points = 0;
  this.index = undefined;
  this.cards = new Set();
}

Player.prototype.draw = function(card) {
  return this.cards.delete(card);
};

Player.prototype.give = function(cards) {
  for (let card of cards) {
    this.cards.add(card);
  }
};

Player.prototype.toString = function() {
  return `${this.name}`;
};

Player.withName = function(name) {
  if (typeof name === 'string' && name.length) {
    return new Player(name);
  }
};

Player.fromProps = function(props) {
  let { name, points, index } = props;
  let player = Player.withName(name);
  player.points = points;
  player.index = index;
  return player;
};

Player.sequence = function(group, from) {
  let start = from ? group.indexOf(from) : 0;

  let next = function*() {
    let index = start;
    let count = group.length;

    while (count-- > 0) {
      yield group[index++ % group.length];
    }
  };

  return { [Symbol.iterator]: next };
};

Player.across = function(group, from) {
  let start = from ? group.indexOf(from) : 0;
  let index = (start + group.length/2) % group.length;
  return group[index];
};

