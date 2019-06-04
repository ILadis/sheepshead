
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
    let player = new Player('Player 1');
    let actor = new Player('Player 2');
    actor.cards.add(
      Card[Suit.heart][Rank.king],
      Card[Suit.leaf][Rank.seven],
      Card[Suit.leaf][Rank.ace],
      Card[Suit.acorn][Rank.sergeant]
    );

    it('should enforce ownership of card', () => {
      let trick = new Trick();
      let rules = Ruleset.forPlaying({ actor, trick });
      for (let card of [
        Card[Suit.bell][Rank.eight],
        Card[Suit.bell][Rank.nine],
        Card[Suit.leaf][Rank.ten],
      ]) {
        Assert.ok(!rules.valid(card));
      }
    });

    it('should enforce trump cards', () => {
      let contract = Contract.solo.leaf;
      let trick = new Trick();
      trick.add(player, Card[Suit.leaf][Rank.eight]);

      let rules = Ruleset.forPlaying({ actor, trick, contract });
      let options = Array.from(rules.options(actor.cards));

      Assert.deepEqual(options, [
        Card[Suit.leaf][Rank.seven],
        Card[Suit.leaf][Rank.ace],
        Card[Suit.acorn][Rank.sergeant]
      ]);
    });

    it('should enforce partner card', () => {
      let contract = Contract.normal.leaf;
      let trick = new Trick();
      trick.add(player, Card[Suit.leaf][Rank.eight]);

      let rules = Ruleset.forPlaying({ actor, trick, contract });
      let options = Array.from(rules.options(actor.cards));

      Assert.deepEqual(options, [
        Card[Suit.leaf][Rank.ace]
      ]);
    });

    it('should enforce partner card when in lead', () => {
      let contract = Contract.normal.leaf;
      let trick = new Trick();
      let rules = Ruleset.forPlaying({ actor, trick, contract });

      let card = Card[Suit.leaf][Rank.seven];
      Assert.equal(rules.valid(card), false);

      let partner = Card[Suit.leaf][Rank.ace];
      Assert.equal(rules.valid(partner), true);
    });

    it('should enforce dominant cards', () => {
      let contract = Contract.geier.default;
      contract.order.dominate(Suit.acorn);
      let trick = new Trick();

      let rules = Ruleset.forPlaying({ actor, trick, contract });
      let options = Array.from(rules.options(actor.cards));

      Assert.deepEqual(options, [
        Card[Suit.acorn][Rank.sergeant]
      ]);
    });

    it('should not enforce any card if actor does not have lead suit', () => {
      let contract = Contract.normal.leaf;
      contract.order.dominate(Suit.bell);
      let trick = new Trick();
      trick.add(player, Card[Suit.bell][Rank.ace]);

      let rules = Ruleset.forPlaying({ actor, trick, contract });
      let options = Array.from(rules.options(actor.cards));

      Assert.deepEqual(options, [
        Card[Suit.heart][Rank.king],
        Card[Suit.leaf][Rank.seven],
        Card[Suit.leaf][Rank.ace],
        Card[Suit.acorn][Rank.sergeant]
      ]);
    })
  });
});

