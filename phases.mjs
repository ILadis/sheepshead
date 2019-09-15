
import { Deck } from './deck.mjs';
import { Trick } from './trick.mjs';
import { Player } from './player.mjs';
import { Contract } from './contract.mjs';
import { Auction } from './auction.mjs';
import { Ruleset } from './ruleset.mjs';
import { Result } from './result.mjs';

export async function joining() {
  let rules = Ruleset.forJoining(this);

  let players = new Array();
  this.players = players;

  for (let index of [1, 2, 3, 4]) {
    do {
      var player = await this.onjoin(index, rules);
    } while (!rules.valid(player));

    players.push(player);
    this.onjoined(player);
  }

  let next = Player.next(players);
  this.head = next;

  return dealing;
}

export async function dealing({ players, head }) {
  let sequence = Player.sequence(players, head);
  this.sequence = sequence;

  let deck = new Deck();
  deck.fill();
  deck.shuffle();

  do {
    for (let player of sequence) {
      let cards = deck.draw();
      player.cards.addAll(cards);
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

  let winner = auction.winner();
  return winner ? bidding : proceed;
}

export async function bidding({ auction }) {
  let rules = Ruleset.forBidding(this);

  let winner = auction.winner();
  while (!auction.settled()) {
    this.onbidded(winner);

    for (let player of auction.bidders()) {
      if (player == winner.owner) {
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
        winner = contract;
      } else {
        auction.concede(player);
      }
    }
  }

  this.contract = winner;
  this.onsettled(winner);

  return playing;
}

export async function playing({ contract, sequence, players }) {
  let rules = Ruleset.forPlaying(this);

  let trick = new Trick();
  this.trick = trick;

  let order = contract.order;
  order.dominate();

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

    trick.play(player, card);
    this.onplayed(player, card, trick);

    if (contract.partner == card) {
      contract.partner = player;
      this.onmatched(contract);
    }
  }

  let winner = trick.winner(order);
  winner.result.claim(trick);

  this.oncompleted(trick, winner);

  var sequence = Player.sequence(players, winner);
  this.sequence = sequence;

  return winner.cards.empty() ? aftermath : playing;
}

export async function aftermath({ contract, players }) {
  let declarer = new Result();
  let defender = new Result();

  for (let player of players) {
    switch (player) {
    case contract.owner:
    case contract.partner:
      declarer.merge(player.result);
      break;
    default:
      defender.merge(player.result);
    }
  }

  let result = Result.compare(declarer, defender);
  let multiplier = Result.multiplier(result, contract);
  let score = 5 * multiplier;

  let { winner, loser } = result;

  for (let player of winner.players) {
    player.wins++;
    player.score += score;
  }

  this.onfinished(winner, loser);

  return proceed;
}

export async function proceed({ players, head }) {
  this.actor = null;
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

