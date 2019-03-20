
export function Player(name, index) {
  this.name = name;
  this.index = index;
  this.points = 0;
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

Player.next = function(group, from) {
  let index = from ? group.indexOf(from) : 0;
  let next = ++index % group.length;
  return group[next];
};

