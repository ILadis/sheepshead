
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

  return options.values();
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

    if (auction.isBidder(actor)) {
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
    let order = contract.order;

    if (!partner) {
      return next();
    }

    if (actor.hasCard(partner)) {
      return false;
    }

    for (let card of actor.cards) {
      if (card.suit == partner.suit && !order.isTrump(card)) {
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

    return enforceOwns({ actor, card },
      () => enforceTrump({ actor, contract, lead, card },
        () => enforcePartner({ actor, contract, lead, card }, 
          () => enforceDominant({ actor, contract, lead, card },
            () => true))));
  });

  function enforceOwns({ actor, card }, next) {
    if (!actor.hasCard(card)) {
      return false;
    }
    return next();
  }

  function enforceTrump({ actor, contract, lead, card }, next) {
    let order = contract.order;
    if (order.isTrump(lead)) {
      for (let trump of order.trumps) {
        if (actor.hasCard(trump)) {
          return order.isTrump(card);
        }
      }
    }

    return next();
  }

  function enforcePartner({ actor, contract, lead, card }, next) {
    let partner = contract.partner;
    let order = contract.order;

    if (!order.isTrump(lead)) {
      if (lead.suit == partner.suit && actor.hasCard(partner)) {
        return card == partner;
      }
    }

    return next();
  }

  function enforceDominant({ actor, contract, lead, card }, next) {
    let order = contract.order;

    for (let dominant of order.dominants) {
      if (actor.hasCard(dominant)) {
        return order.isDominant(card);
      }
    }

    return next();
  }
};

