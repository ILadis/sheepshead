
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

  let next = () => options.values();
  return { [Symbol.iterator]: next };
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

    if (auction.includes(actor)) {
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

    if (actor.cards.contains(partner)) {
      return false;
    }

    let order = contract.order;
    for (let card of actor.cards) {
      if (card.suit == partner.suit && !order.trumps.contains(card)) {
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
    if (!actor.cards.contains(card)) {
      return false;
    }
    if (actor.cards.size() == 1) {
      return true;
    }
    return next();
  }

  function enforceTrump({ actor, contract, lead, card }, next) {
    let order = contract.order;
    if (order.trumps.contains(lead)) {
      for (let trump of order.trumps) {
        if (actor.cards.contains(trump)) {
          return order.trumps.contains(card);
        }
      }
    }

    return next();
  }

  function enforcePartner({ actor, contract, lead, card }, next) {
    let order = contract.order;
    let partner = contract.partner;

    if (partner) {
      let called = lead.suit == partner.suit && !order.trumps.contains(lead);
      if (called && actor.cards.contains(partner)) {
        return card == partner;
      }

      if (card == partner) {
        return called;
      }
    }

    return next();
  }

  function enforceDominant({ actor, contract, card }, next) {
    let order = contract.order;
    for (let dominant of order.dominants) {
      if (actor.cards.contains(dominant)) {
        return order.dominants.contains(card);
      }
    }

    return next();
  }
};

