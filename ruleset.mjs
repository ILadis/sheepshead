
export function Ruleset(validator) {
  this.validator = validator;
};

Ruleset.prototype.isValid = function(...args) {
  return this.validator.apply(this, args);
};

Ruleset.forBidding = function(game) {
  return new Ruleset((contract) => {
    let { actor } = game;

    if (contract.owner != actor) {
      return false;
    }

    let { trumps } = contract.order;
    let partner = contract.partner;

    if (contract.owner == partner) {
      return false;
    }

    if (actor.cards.has(partner)) {
      return false;
    }

    if (partner) {
      for (let card of actor.cards) {
        if (card.suit == partner.suit && !trumps.has(card)) {
          return true;
        }
      }

      return false;
    }

    return true;
  });
};

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

