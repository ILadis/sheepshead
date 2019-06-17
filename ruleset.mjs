
export function Ruleset(...validators) {
  this.validators = validators;
};

Ruleset.prototype.valid = function(...args) {
  let iterator = this.validators.values();
  let next = () => {
    let { done, value } = iterator.next();
    if (!done) {
      return value.call(this, ...args, next);
    }

    return true;
  };
  return next();
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
  return new Ruleset(honorConcede, enforceValue, enforcePartner);

  function honorConcede(contract, next) {
    if (!contract) {
      return true;
    }
    return next();
  }

  function enforceValue(contract, next) {
    let { auction, actor } = game;
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

  function enforcePartner(contract, next) {
    let { actor } = game;
    let { partner, order: { trumps } } = contract;

    if (!partner) {
      return next();
    }

    if (actor.cards.contains(partner)) {
      return false;
    }

    for (let card of actor.cards) {
      if (card.suit == partner.suit && !trumps.contains(card)) {
        return true;
      }
    }

    return false;
  }
};

Ruleset.forPlaying = function(game) {
  return new Ruleset(enforceOwns, enforceTrump, enforcePartner, enforceDominant);

  function enforceOwns(card, next) {
    let { actor } = game;

    if (!actor.cards.contains(card)) {
      return false;
    }
    if (actor.cards.size() == 1) {
      return true;
    }
    return next();
  }

  function enforceTrump(card, next) {
    let { actor, contract: { order }, trick } = game;
    let lead = trick.lead() || card;

    if (order.trumps.contains(lead)) {
      for (let trump of order.trumps) {
        if (actor.cards.contains(trump)) {
          return order.trumps.contains(card);
        }
      }
    }

    return next();
  }

  function isPartnerCalled(card) {
    let { contract: { partner, order }, trick } = game;
    let lead = trick.lead() || card;

    if (!partner) {
      return false;
    }

    return lead.suit == partner.suit && !order.trumps.contains(lead);
  }

  function enforcePartner(card, next) {
    let { actor, contract: { partner } } = game;
    let called = isPartnerCalled(card);

    if (partner) {
      if (called && actor.cards.contains(partner)) {
        return card == partner;
      }

      if (card == partner) {
        return called;
      }
    }

    return next();
  }

  function enforceDominant(card, next) {
    let { actor, contract: { order } } = game;

    for (let dominant of order.dominants) {
      if (actor.cards.contains(dominant)) {
        return order.dominants.contains(card);
      }
    }

    return next();
  }
};

