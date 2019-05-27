
export function Ruleset(validator) {
  this.validator = validator;
};

Ruleset.prototype.valid = function(...args) {
  return this.validator.apply(this, args);
};

Ruleset.prototype.options = function(iterator) {
  let options = new Set();
  for (let item of iterator) {
    if (this.valid(item)) {
      options.add(item);
    }
  }

  if (options.size <= 0) {
    return false;
  }

  return options;
}

Ruleset.forBidding = function(game) {
  return new Ruleset((contract) => {
    let { auction, actor } = game;

    return honorConcede({ contract },
      () => enforceValue({ actor, auction, contract },
        () => enforcePartner({ actor, contract },
          () => true)));
  });

  function honorConcede({ contract }, next) {
    if (!contract) {
      return true;
    }
    return next();
  }

  function enforceValue({ actor, auction, contract }, next) {
    let lead = auction.lead();
    let minimum = auction.blind();
    if (auction.bids.has(actor)) {
      minimum = lead.value;
    }

    for (let bidder of auction.bidders()) {
      if (bidder == actor) break;
      else if (bidder == lead.owner) {
        minimum++;
      }
    }

    if (contract.value < minimum) {
      return false;
    }

    return next();
  }

  function enforcePartner({ actor, contract }, next) {
    let partner = contract.partner;
    if (!partner) {
      return next();
    }

    if (actor.cards.has(partner)) {
      return false;
    }

    let trumps = contract.order.trumps;
    for (let card of actor.cards) {
      if (card.suit == partner.suit && !trumps.has(card)) {
        return true;
      }
    }

    return false;
  }
};

Ruleset.forPlaying = function(game) {
  return new Ruleset((card) => {
    let { actor, contract, trick } = game;
    let lead = trick.lead() || card;

    return hasCard({ actor, card },
      () => enforceTrump({ actor, contract, lead, card },
        () => enforcePartner({ actor, contract, lead, card }, 
          () => enforceDominant({ actor, contract, lead, card },
            () => true))));
  });

  function hasCard({ actor, card }, next) {
    if (!actor.cards.has(card)) {
      return false;
    }
    return next();
  }

  function enforceTrump({ actor, contract, lead, card }, next) {
    let trumps = contract.order.trumps;
    if (trumps.has(lead)) {
      for (let trump of trumps) {
        if (actor.cards.has(trump)) {
          return trumps.has(card);
        }
      }
    }

    return next();
  }

  function enforcePartner({ actor, contract, lead, card }, next) {
    let trumps = contract.order.trumps;
    let partner = contract.partner;

    if (!trumps.has(lead)) {
      if (actor.cards.has(partner) && lead.suit == partner.suit) {
        return card == partner;
      }
    }

    return next();
  }

  function enforceDominant({ actor, contract, lead, card }, next) {
    let dominants = contract.order.dominants;

    if (dominants.has(lead)) {
      for (let dominant of dominants) {
        if (actor.cards.has(dominant)) {
          return dominants.has(card);
        }
      }
    }

    return next();
  }
};

