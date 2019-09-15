
import { Deck } from './deck.mjs';
import { Result } from './result.mjs';

export function Player(name, index) {
  this.name = name;
  this.index = index;
  this.cards = new Deck();
  this.result = new Result(this);
  this.wins = 0;
  this.score = 0;
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

