
import { Card, Suit, Rank } from './card.mjs';
import { Deck } from './deck.mjs';
import { Trick } from './trick.mjs';
import { Player } from './player.mjs';
import { Contract } from './contract.mjs';
import { Auction } from './auction.mjs';
import { Result } from './result.mjs';
import { Ruleset } from './ruleset.mjs';

export async function joining() {
  let players = new Array();
  this.players = players;

  for (let index of [1, 2, 3, 4]) {
    let player = await this.onjoin(index);
    players.push(player);

    await this.onjoined(player);
  }

  let next = Player.next(players);
  this.head = next;

  return dealing;
}

export async function dealing({ players, head }) {
  let sequence = Player.sequence(players, head);
  this.sequence = sequence;

  let deck = new Deck();
  for (let suit of Suit) {
    for (let rank of Rank) {
      let card = Card[suit][rank];
      deck.add(card);
    }
  }

  deck.shuffle();

  do {
    for (let player of sequence) {
      let cards = deck.draw();
      player.cards.add(...cards);
    }
  } while (!deck.empty());

  await this.ondealt(players);

  return attendance;
}

export async function attendance({ sequence, phase }) {
  let rules = Ruleset.forBidding(this);

  let auction = new Auction();
  this.auction = auction;

  for (let player of sequence) {
    this.actor = player;
    await this.onturn(player, phase);

    do {
      var contract = await this.onbid(player, rules);
    } while (!rules.valid(contract));

    if (contract) {
      contract.assign(player);
      auction.bid(contract);

      await this.oncontested(player);
    }
  }

  let lead = auction.lead();
  if (!lead) {
    return proceed;
  }

  return bidding;
}

export async function bidding({ auction, phase }) {
  let rules = Ruleset.forBidding(this);

  let lead = auction.lead();
  while (!auction.settled()) {
    await this.onbidded(lead);

    for (let player of auction.bidders()) {
      if (player == lead.owner) {
        continue;
      }

      this.actor = player;
      await this.onturn(player, phase);

      let options = rules.options(Contract);
      if (!options) {
        auction.concede(player);
        continue;
      }

      do {
        var contract = await this.onbid(player, rules);
      } while (!rules.valid(contract));

      if (contract) {
        contract.assign(player);
        auction.bid(contract);
        lead = contract;
      } else {
        auction.concede(player);
      }
    }
  }

  this.contract = lead;
  await this.onsettled(lead);

  return playing;
}

export async function playing({ contract, sequence, phase }) {
  let rules = Ruleset.forPlaying(this);

  let trick = new Trick();
  this.trick = trick;

  let order = contract.order;
  order.dominants.clear();

  for (let player of sequence) {
    this.actor = player;
    await this.onturn(player, phase);

    do {
      var card = await this.onplay(player, rules);
    } while (!rules.valid(card));

    player.cards.remove(card);

    if (trick.empty()) {
      order.dominate(card);
    }

    trick.add(player, card);
    await this.onplayed(player, card, trick);

    if (contract.partner == card) {
      contract.partner = player;
      await this.onmatched(contract);
    }
  }

  return countup;
}

export async function countup({ players, contract, trick }) {
  let order = contract.order;
  let winner = trick.winner(order);
  winner.points += trick.points();

  this.sequence = Player.sequence(players, winner);
  await this.oncompleted(trick, winner);

  return winner.cards.empty() ? aftermath : playing;
}

export async function aftermath({ players, contract }) {
  let declarer = new Result();
  let defender = new Result();

  for (let player of players) {
    switch (player) {
    case contract.owner:
    case contract.partner:
      declarer.add(player);
      break;
    default:
      defender.add(player);
    }
  }

  let { winner, loser } = Result.compare(declarer, defender);
  await this.onfinished(winner, loser);

  return proceed;
}

export async function proceed({ players, head, phase }) {
  this.contract = null;
  this.trick = null;

  for (let player of players) {
    player.cards.clear();
    player.points = 0;

    this.actor = player;
    await this.onturn(player, phase);

    let proceed = await this.onproceed(player);
    if (!proceed) {
      return;
    }
  }

  let next = Player.next(players, head);
  this.head = next;

  return dealing;
}

