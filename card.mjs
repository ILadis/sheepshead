
export function Card(suit, rank) {
  this.suit = suit;
  this.rank = rank;
}

Card.prototype.points = function(card) {
  switch (this.rank) {
    case Ranks.Ace:
      return 11;
    case Ranks.Ten:
      return 10;
    case Ranks.King:
      return 4;
    case Ranks.Officer:
      return 3;
    case Ranks.Sergeant:
      return 2;
    default:
      return 0;
  }
};

Card.prototype.toString = function() {
  return `[${this.suit.description} ${this.rank.description}]`;
};

export const Suits = Object.freeze({
  Bell: Symbol('Bell'),
  Heart: Symbol('Heart'),
  Leaf: Symbol('Leaf'),
  Acorn: Symbol('Acorn'),

  [Symbol.iterator]: function*() {
    let suits = Object.values(Suits);
    for (let suit of suits) {
      yield suit;
    }
  }
});

export const Ranks = Object.freeze({
  Seven: Symbol('Seven'),
  Eight: Symbol('Eight'),
  Nine: Symbol('Nine'),
  Sergeant: Symbol('Sergeant'),
  Officer: Symbol('Officer'),
  King: Symbol('King'),
  Ten: Symbol('Ten'),
  Ace: Symbol('Ace'),

  [Symbol.iterator]: function*() {
    let ranks = Object.values(Ranks);
    for (let rank of ranks) {
      yield rank;
    }
  }
});

for (let suit of Suits) {
  Card[suit] = new Object();
  for (let rank of Ranks) {
    Card[suit][rank] = new Card(suit, rank);
  }
}

Card.byName = function(suit, rank) {
  let valueOf = v => 
    String(v).charAt(0).toUpperCase() +
    String(v).slice(1).toLowerCase();

  let suit = Suits[valueOf(json.suit)];
  let rank = Ranks[valueOf(json.rank)];

  if (Card[suit] && Card[suit][rank]) {
    return Card[suit][rank];
  }
};

