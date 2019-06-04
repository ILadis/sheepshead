
import { Deck } from './deck.mjs';

export function Player(name, index) {
  this.name = name;
  this.index = index;
  this.points = 0;
  this.cards = new Deck();
}

Player.sequence = function(group, from) {
  let start = group.indexOf(from);
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
  let index = group.indexOf(from);
  let next = ++index % group.length;
  return group[next];
};

