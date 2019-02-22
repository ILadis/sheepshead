
export function Ruleset(validator) {
  this.validator = validator;
};

Ruleset.prototype.isValid = function(...args) {
  return this.validator.apply(this, args);
};

// TODO implement ruleset for bidding/auction

Ruleset.forPlaying = function(game) {
  return new Ruleset((card) => {
    let { actor, contract, trick } = game;

    if (!actor.cards.has(card)) {
      return false;
    }

    let { trumps, dominants } = contract.order;
    let lead = trick.lead();

    if (dominants.has(lead)) {
      for (let dominant of dominants) {
        if (actor.cards.has(dominant)) {
          return dominants.has(card);
        }
      }
    }

    if (trumps.has(lead)) {
      for (let trump of trumps) {
        if (actor.cards.has(trump)) {
          return trumps.has(card);
        }
      }
    }

    return true;
  });
};

