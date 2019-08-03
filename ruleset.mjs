
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

Ruleset.forJoining = function(game) {
  return new Ruleset(preserveIndex, nonEmptyName);

  function preserveIndex(player, next) {
    let { players } = game;
    let index = players.length + 1;

    if (player.index !== index) {
      return false;
    }

    return next();
  }

  function nonEmptyName(player, next) {
    if (typeof player.name !== 'string') {
      return false;
    }

    if (!player.name.length) {
      return false;
    }

    return next();
  }
};

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
    let winner = auction.winner();
    let minimum = auction.blind();

    if (auction.includes(actor)) {
      minimum = winner.value;
    }

    for (let bidder of auction.bidders()) {
      if (bidder == actor) break;
      else if (bidder == winner.owner) {
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

  function forcedToFollow(deck) {
    let { actor, trick } = game;
    let lead = trick.lead();

    if (deck.contains(lead)) {
      for (let card of deck) {
        if (actor.cards.contains(card)) {
          return true;
        }
      }
    }

    return false;
  }

  function enforceTrump(card, next) {
    let { contract: { order } } = game;

    if (forcedToFollow(order.trumps)) {
      return order.trumps.contains(card);
    }

    return next();
  }

  function partnerCalled(card) {
    let { contract: { partner, order }, trick } = game;
    let lead = trick.lead() || card;

    if (partner && lead.suit == partner.suit) {
      return !order.trumps.contains(lead);
    }

    return false;
  }

  function enforcePartner(card, next) {
    let { actor, contract: { partner } } = game;
    let called = partnerCalled(card);

    if (actor.cards.contains(partner)) {
      if (called) {
        return card == partner;
      }

      if (card == partner) {
        return called;
      }
    }

    return next();
  }

  function enforceDominant(card, next) {
    let { contract: { order } } = game;

    if (forcedToFollow(order.dominants)) {
      return order.dominants.contains(card);
    }

    return next();
  }
};

