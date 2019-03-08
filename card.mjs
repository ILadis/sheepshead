
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

export const Suit = Object.create(null);
Suit.bell = Symbol('Bell');
Suit.heart = Symbol('Heart');
Suit.leaf = Symbol('Leaf');
Suit.acorn = Symbol('Acorn');

Suit[Symbol.iterator] = function*() {
  let values = Object.values(Suit);
  for (let value of values) {
    yield value;
  }
};

export const Rank = Object.create(null);
Rank.seven = Symbol('Seven');
Rank.eight = Symbol('Eight');
Rank.nine = Symbol('Nine');
Rank.sergeant = Symbol('Sergeant');
Rank.officer = Symbol('Officer');
Rank.king = Symbol('King');
Rank.ten = Symbol('Ten');
Rank.ace = Symbol('Ace');

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

