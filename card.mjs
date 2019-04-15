
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
  bell: Symbol('Bell'),
  heart: Symbol('Heart'),
  leaf: Symbol('Leaf'),
  acorn: Symbol('Acorn')
};

Suit[Symbol.iterator] = function*() {
  let values = Object.values(Suit);
  for (let value of values) {
    yield value;
  }
};

export const Rank = {
  seven: Symbol('Seven'),
  eight: Symbol('Eight'),
  nine: Symbol('Nine'),
  sergeant: Symbol('Sergeant'),
  officer: Symbol('Officer'),
  king: Symbol('King'),
  ten: Symbol('Ten'),
  ace: Symbol('Ace')
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

