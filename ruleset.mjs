
export function Ruleset(validator) {
  this.validator = validator;
};

Ruleset.prototype.isValid = function(...args) {
  return this.validator.apply(this, args);
};

Ruleset.forBidding = function(game) {
  return new Ruleset((contract) => {
    let { actor, attendants } = game;

    if (contract.owner != actor) {
      return false;
    }

    let index = attendants.indexOf(actor);
    if (contract.value <= index) {
      return false;
    }

    let { trumps } = contract.order;
    let partner = contract.partner;

    if (!partner) {
      return true;
    }

    if (actor.cards.has(partner)) {
      return false;
    }

    for (let card of actor.cards) {
      if (card.suit == partner.suit && !trumps.has(card)) {
        return true;
      }
    }

    return false;
  });
};

Ruleset.forPlaying = function(game) {
  return new Ruleset((card) => {
    let { actor, contract, trick } = game;

    if (!actor.cards.has(card)) {
      return false;
    }

    let { trumps, dominants } = contract.order;
    let partner = contract.partner;
    let lead = trick.lead() || card;

    if (actor.cards.has(partner)) {
      if (lead.suit == partner.suit) {
        return card == partner;
      }
    }

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

