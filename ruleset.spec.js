
import Assert from 'assert';
import { Ruleset } from './ruleset.mjs';
import { Player } from './player.mjs';
import { Trick } from './trick.mjs';
import { Contract } from './contract.mjs';
import { Card, Suit, Rank } from './card.mjs';

describe('Ruleset', () => {
  describe('#valid()', () => {
    it('should call validator with arguments', () => {
      let validator = (...args) => validator.args = args;
      let rules = new Ruleset(validator);
      rules.valid(13, 37);
      Assert.deepEqual(validator.args, [13, 37]);
    });

    it('should return result of validator', () => {
      let validator = () => true;
      let rules = new Ruleset(validator);
      Assert.equal(rules.valid(), true);
    });
  });

  describe('#options()', () => {
    it('should return iterator of unique options', () => {
      let validator = (num) => num % 2 == 0;
      let rules = new Ruleset(validator);
      let numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1];
      let it = rules.options(numbers);
      Assert.equal(it.next().value, 2);
      Assert.equal(it.next().value, 4);
      Assert.ok(it.next().done);
    });

    it('should return false on zero options', () => {
      let validator = (num) => num < 0;
      let rules = new Ruleset(validator);
      let numbers = [1, 2, 3];
      let it = rules.options(numbers);
      Assert.equal(it, false);
    });
  });

  describe('#forPlaying()', () => {
    it('should enforce ownership of card', () => {
      let trick = new Trick();
      let actor = new Player('Actor');
      actor.cards.add(
        Card[Suit.heart][Rank.king],
        Card[Suit.leaf][Rank.seven]
      );

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
      trick.add(new Player('Player'), lead);

      let actor = new Player('Actor');
      actor.cards.add(
        Card[Suit.heart][Rank.king],
        Card[Suit.leaf][Rank.seven],
        Card[Suit.leaf][Rank.ace],
        Card[Suit.acorn][Rank.sergeant]
      );

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
      trick.add(new Player('Player'), lead);

      let actor = new Player('Actor');
      actor.cards.add(
        Card[Suit.heart][Rank.king],
        Card[Suit.leaf][Rank.seven],
        Card[Suit.leaf][Rank.ace],
        Card[Suit.acorn][Rank.sergeant]
      );

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
      trick.add(new Player('Player'), lead);

      let actor = new Player('Actor');
      actor.cards.add(
        Card[Suit.leaf][Rank.seven],
        Card[Suit.leaf][Rank.ace]
      );

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
      trick.add(new Player('Player'), lead);

      let actor = new Player('Actor');
      actor.cards.add(
        Card[Suit.leaf][Rank.seven],
        Card[Suit.leaf][Rank.ace]
      );

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
      actor.cards.add(
        Card[Suit.leaf][Rank.seven],
        Card[Suit.leaf][Rank.ace]
      );

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
      trick.add(new Player('Player'), lead);

      let actor = new Player('Actor');
      actor.cards.add(
        Card[Suit.leaf][Rank.ace],
        Card[Suit.acorn][Rank.sergeant]
      );

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
      trick.add(new Player('Player'), lead);

      let actor = new Player('Actor');
      actor.cards.add(
        Card[Suit.heart][Rank.king],
        Card[Suit.leaf][Rank.seven],
        Card[Suit.leaf][Rank.ace],
        Card[Suit.acorn][Rank.sergeant]
      );

      let rules = Ruleset.forPlaying({ actor, trick, contract });
      let options = Array.from(rules.options(actor.cards));

      Assert.deepEqual(options, [
        Card[Suit.heart][Rank.king],
        Card[Suit.leaf][Rank.seven],
        Card[Suit.acorn][Rank.sergeant]
      ]);
    });
  });
});

