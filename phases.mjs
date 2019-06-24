
import { Card, Suit, Rank } from './card.mjs';
import { Deck } from './deck.mjs';
import { Trick } from './trick.mjs';
import { Player } from './player.mjs';
import { Contract } from './contract.mjs';
import { Auction } from './auction.mjs';
import { Scoreboard } from './scoreboard.mjs';
import { Ruleset } from './ruleset.mjs';

export async function joining() {
  let players = new Array();
  this.players = players;

  for (let index of [1, 2, 3, 4]) {
    let player = await this.onjoin(index);
    players.push(player);

    this.onjoined(player);
  }

  let scores = new Scoreboard(players);
  this.scores = scores;

  let next = Player.next(players);
  this.head = next;

  return dealing;
}

export async function dealing({ players, head, rand }) {
  let sequence = Player.sequence(players, head);
  this.sequence = sequence;

  let deck = new Deck();
  for (let suit of Suit) {
    for (let rank of Rank) {
      deck.add(Card[suit][rank]);
    }
  }

  deck.shuffle(rand);

  do {
    for (let player of sequence) {
      let cards = deck.draw();
      player.cards.add(...cards);
    }
  } while (!deck.empty());

  this.ondealt(players);

  return attendance;
}

export async function attendance({ sequence }) {
  let rules = Ruleset.forBidding(this);

  let auction = new Auction();
  this.auction = auction;

  for (let player of sequence) {
    this.actor = player;
    this.onturn(player, attendance);

    do {
      var contract = await this.onbid(player, rules);
    } while (!rules.valid(contract));

    if (contract) {
      contract.assign(player);
      auction.bid(contract);

      this.oncontested(player);
    }
  }

  let lead = auction.lead();
  this.contract = lead;

  return lead ? bidding : proceed;
}

export async function bidding({ auction }) {
  let rules = Ruleset.forBidding(this);

  let lead = auction.lead();
  while (!auction.settled()) {
    this.onbidded(lead);

    for (let player of auction.bidders()) {
      if (player == lead.owner) {
        continue;
      }

      this.actor = player;
      this.onturn(player, bidding);

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
  this.onsettled(lead);

  return playing;
}

export async function playing({ contract, sequence }) {
  let rules = Ruleset.forPlaying(this);

  let trick = new Trick();
  this.trick = trick;

  let order = contract.order;
  order.dominants.clear();

  for (let player of sequence) {
    this.actor = player;
    this.onturn(player, playing);

    do {
      var card = await this.onplay(player, rules);
    } while (!rules.valid(card));

    player.cards.remove(card);

    if (trick.empty()) {
      order.dominate(card);
    }

    trick.add(player, card);
    this.onplayed(player, card, trick);

    if (contract.partner == card) {
      contract.partner = player;
      this.onmatched(contract);
    }
  }

  return award;
}

export async function award({ contract, trick, scores, players }) {
  let order = contract.order;

  let winner = trick.winner(order);
  this.oncompleted(trick, winner);

  scores.claim(winner, trick);

  let sequence = Player.sequence(players, winner);
  this.sequence = sequence;

  if (!winner.cards.empty()) {
    return playing;
  }

  let result = scores.result(contract);
  if (result) {
    scores.award(result);

    let { winner, loser } = result;
    this.onfinished(winner, loser);
  }

  return proceed;
}

export async function proceed({ players, head }) {
  for (let player of players) {
    player.cards.clear();
  }

  let proceed = await this.onproceed();
  if (!proceed) {
    return finish;
  }

  let next = Player.next(players, head);
  this.head = next;

  return dealing;
}

export async function finish() {
}

