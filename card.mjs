
export function Card(suit, rank) {
  this.suit = suit;
  this.rank = rank;
}

Card.prototype.points = function() {
  switch (this.rank) {
    case Rank.ace:
      return 11;
    case Rank.ten:
      return 10;
    case Rank.king:
      return 4;
    case Rank.officer:
      return 3;
    case Rank.sergeant:
      return 2;
    default:
      return 0;
  }
};

export const Suit = {
  bell: Symbol('bell'),
  heart: Symbol('heart'),
  leaf: Symbol('leaf'),
  acorn: Symbol('acorn')
};

Suit[Symbol.iterator] = function*() {
  let values = Object.values(Suit);
  for (let value of values) {
    yield value;
  }
};

export const Rank = {
  seven: Symbol('seven'),
  eight: Symbol('eight'),
  nine: Symbol('nine'),
  sergeant: Symbol('sergeant'),
  officer: Symbol('officer'),
  king: Symbol('king'),
  ten: Symbol('ten'),
  ace: Symbol('ace')
};

Rank[Symbol.iterator] = function*() {
  let values = Object.values(Rank);
  for (let value of values) {
    yield value;
  }
};

for (let suit of Suit) {
  Card[suit] = Object.create(null);
  for (let rank of Rank) {
    Card[suit][rank] = new Card(suit, rank);
  }
}

