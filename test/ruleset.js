
import Assert from 'assert';
import { Ruleset } from '../ruleset.mjs';
import { Player } from '../player.mjs';
import { Trick } from '../trick.mjs';
import { Contract } from '../contract.mjs';
import { Auction } from '../auction.mjs';
import { Card, Suit, Rank } from '../card.mjs';

describe('Ruleset', () => {
  describe('#valid()', () => {
    it('should call validator with arguments and next function', () => {
      let args, validator = function() { args = arguments; };
      let rules = new Ruleset(validator);
      rules.valid(13, 37);
      Assert.equal(args[0], 13);
      Assert.equal(args[1], 37);
      Assert.equal(typeof args[2], 'function');
    });

    it('should return result of validator', () => {
      let validator = () => 42;
      let rules = new Ruleset(validator);
      Assert.equal(rules.valid(), 42);
    });

    it('should call next validator in chain', () => {
      let validator1 = (next) => next();
      let validator2 = () => 42;
      let rules = new Ruleset(validator1, validator2);
      Assert.equal(rules.valid(), 42);
    });
  });

  describe('#options()', () => {
    it('should be iterable', () => {
      let validator = () => true;
      let rules = new Ruleset(validator);
      let numbers = [1, 2, 3];
      let options = rules.options(numbers);
      Assert.ok(options[Symbol.iterator]);
    });

    it('should yield unique valid options', () => {
      let validator = (num) => num % 2 == 0;
      let rules = new Ruleset(validator);
      let numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1];
      let options = rules.options(numbers);
      let it = options[Symbol.iterator]();
      Assert.equal(it.next().value, 2);
      Assert.equal(it.next().value, 4);
      Assert.ok(it.next().done);
    });

    it('should return false for zero options', () => {
      let validator = (num) => num < 0;
      let rules = new Ruleset(validator);
      let numbers = [1, 2, 3];
      let options = rules.options(numbers);
      Assert.equal(options, false);
    });
  });
});

describe('Ruleset#forBidding()', () => {
  it('should honor concede', () => {
    let auction = new Auction();
    let actor = new Player('Actor');

    let rules = Ruleset.forBidding({ auction, actor });

    Assert.ok(rules.valid(null));
  });

  it('should force blind value', () => {
    let auction = new Auction();
    let actor = new Player('Actor');

    let contract = Contract.geier.default;
    contract.assign(new Player());
    auction.bid(contract);

    let blind = auction.blind();
    let rules = Ruleset.forBidding({ auction, actor });

    let options = Array.from(rules.options(Contract));
    let values = options.map(c => c.value);
    for (let value of values) {
      Assert.ok(value > blind);
    }
  });

  it('should force equal value when predecessor', () => {
    let auction = new Auction();
    let actor = new Player('Actor');

    let contract1 = Contract.normal.leaf;
    contract1.assign(actor);
    auction.bid(contract1);

    let contract2 = Contract.geier.default;
    contract2.assign(new Player());
    auction.bid(contract2);

    let winner = auction.winner();
    let rules = Ruleset.forBidding({ auction, actor });

    let options = Array.from(rules.options(Contract));
    let values = options.map(c => c.value);
    for (let value of values) {
      Assert.ok(value >= winner.value);
    }
  });

  it('should force higher value when successor', () => {
    let auction = new Auction();
    let actor = new Player('Actor');

    let contract1 = Contract.geier.default;
    contract1.assign(new Player());
    auction.bid(contract1);

    let contract2 = Contract.normal.leaf;
    contract2.assign(actor);
    auction.bid(contract2);

    let winner = auction.winner();
    let rules = Ruleset.forBidding({ auction, actor });

    let options = Array.from(rules.options(Contract));
    let values = options.map(c => c.value);
    for (let value of values) {
      Assert.ok(value > winner.value);
    }
  });

  it('should disallow ownership of partner card', () => {
    let auction = new Auction();
    let actor = new Player('Actor');
    actor.cards.addAll([
      Card[Suit.heart][Rank.king],
      Card[Suit.leaf][Rank.seven],
      Card[Suit.leaf][Rank.ace]
    ]);

    let rules = Ruleset.forBidding({ auction, actor });

    Assert.ok(!rules.valid(Contract.normal.leaf));
  });

  it('should force ownership of non trump partner suit', () => {
    let auction = new Auction();
    let actor = new Player('Actor');
    actor.cards.addAll([
      Card[Suit.heart][Rank.king],
      Card[Suit.bell][Rank.seven],
      Card[Suit.leaf][Rank.officer]
    ]);

    let rules = Ruleset.forBidding({ auction, actor });

    Assert.ok(!rules.valid(Contract.normal.leaf));
    Assert.ok(rules.valid(Contract.normal.bell));
  });
});

describe('Ruleset#forPlaying()', () => {
  it('should enforce ownership of card', () => {
    let trick = new Trick();
    let actor = new Player('Actor');
    actor.cards.addAll([
      Card[Suit.heart][Rank.king],
      Card[Suit.leaf][Rank.seven]
    ]);

    let rules = Ruleset.forPlaying({ actor, trick });
    for (let card of [
      Card[Suit.bell][Rank.eight],
      Card[Suit.bell][Rank.nine],
      Card[Suit.leaf][Rank.ten],
    ]) {
      Assert.ok(!rules.valid(card));
    }
  });

  it('should enforce trump card', () => {
    let lead = Card[Suit.leaf][Rank.eight];

    let contract = Contract.solo.leaf;
    contract.order.dominate(lead);
    let trick = new Trick();
    trick.play(new Player('Player'), lead);

    let actor = new Player('Actor');
    actor.cards.addAll([
      Card[Suit.heart][Rank.king],
      Card[Suit.leaf][Rank.seven],
      Card[Suit.leaf][Rank.ace],
      Card[Suit.acorn][Rank.sergeant]
    ]);

    let rules = Ruleset.forPlaying({ actor, trick, contract });
    let options = Array.from(rules.options(actor.cards));

    Assert.deepEqual(options, [
      Card[Suit.leaf][Rank.seven],
      Card[Suit.leaf][Rank.ace],
      Card[Suit.acorn][Rank.sergeant]
    ]);
  });

  it('should enforce partner card when called', () => {
    let lead = Card[Suit.leaf][Rank.eight];

    let contract = Contract.normal.leaf;
    contract.order.dominate(lead);
    let trick = new Trick();
    trick.play(new Player('Player'), lead);

    let actor = new Player('Actor');
    actor.cards.addAll([
      Card[Suit.heart][Rank.king],
      Card[Suit.leaf][Rank.seven],
      Card[Suit.leaf][Rank.ace],
      Card[Suit.acorn][Rank.sergeant]
    ]);

    let rules = Ruleset.forPlaying({ actor, trick, contract });
    let options = Array.from(rules.options(actor.cards));

    Assert.deepEqual(options, [
      Card[Suit.leaf][Rank.ace]
    ]);
  });

  it('should disallow partner card when not called', () => {
    let lead = Card[Suit.leaf][Rank.sergeant];

    let contract = Contract.normal.leaf;
    contract.order.dominate(lead);
    let trick = new Trick();
    trick.play(new Player('Player'), lead);

    let actor = new Player('Actor');
    actor.cards.addAll([
      Card[Suit.leaf][Rank.seven],
      Card[Suit.leaf][Rank.ace]
    ]);

    let rules = Ruleset.forPlaying({ actor, trick, contract });
    let options = Array.from(rules.options(actor.cards));

    Assert.deepEqual(options, [
      Card[Suit.leaf][Rank.seven]
    ]);
  });

  it('should disallow partner card when not called', () => {
    let lead = Card[Suit.bell][Rank.ace];

    let contract = Contract.normal.leaf;
    contract.order.dominate(lead);
    let trick = new Trick();
    trick.play(new Player('Player'), lead);

    let actor = new Player('Actor');
    actor.cards.addAll([
      Card[Suit.leaf][Rank.seven],
      Card[Suit.leaf][Rank.ace]
    ]);

    let rules = Ruleset.forPlaying({ actor, trick, contract });
    let options = Array.from(rules.options(actor.cards));

    Assert.deepEqual(options, [
      Card[Suit.leaf][Rank.seven]
    ]);
  });

  it('should enforce partner card when in lead', () => {
    let contract = Contract.normal.leaf;
    let trick = new Trick();

    let actor = new Player('Actor');
    actor.cards.addAll([
      Card[Suit.leaf][Rank.seven],
      Card[Suit.leaf][Rank.ace]
    ]);

    let rules = Ruleset.forPlaying({ actor, trick, contract });

    let card = Card[Suit.leaf][Rank.seven];
    Assert.equal(rules.valid(card), false);

    let partner = Card[Suit.leaf][Rank.ace];
    Assert.equal(rules.valid(partner), true);
  });

  it('should enforce dominant card', () => {
    let lead = Card[Suit.acorn][Rank.seven];

    let contract = Contract.geier.default;
    contract.order.dominate(lead);
    let trick = new Trick();
    trick.play(new Player('Player'), lead);

    let actor = new Player('Actor');
    actor.cards.addAll([
      Card[Suit.leaf][Rank.ace],
      Card[Suit.acorn][Rank.sergeant]
    ]);

    let rules = Ruleset.forPlaying({ actor, trick, contract });
    let options = Array.from(rules.options(actor.cards));

    Assert.deepEqual(options, [
      Card[Suit.acorn][Rank.sergeant]
    ]);
  });

  it('should not force card if actor does not have lead', () => {
    let lead = Card[Suit.bell][Rank.ace];

    let contract = Contract.normal.leaf;
    contract.order.dominate(lead);
    let trick = new Trick();
    trick.play(new Player('Player'), lead);

    let actor = new Player('Actor');
    actor.cards.addAll([
      Card[Suit.heart][Rank.king],
      Card[Suit.leaf][Rank.seven],
      Card[Suit.leaf][Rank.ace],
      Card[Suit.acorn][Rank.sergeant]
    ]);

    let rules = Ruleset.forPlaying({ actor, trick, contract });
    let options = Array.from(rules.options(actor.cards));

    Assert.deepEqual(options, [
      Card[Suit.heart][Rank.king],
      Card[Suit.leaf][Rank.seven],
      Card[Suit.acorn][Rank.sergeant]
    ]);
  });
});

