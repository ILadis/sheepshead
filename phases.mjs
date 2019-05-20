
import { Deck } from './deck.mjs';
import { Trick } from './trick.mjs';
import { Player } from './player.mjs';
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
  deck.fill();
  deck.shuffle();

  do {
    for (let player of sequence) {
      let cards = deck.draw();
      player.give(cards);
    }
  } while (!deck.empty());

  await this.ondealt(players);

  return attendance;
}

export async function attendance({ sequence, phase}) {
  let rules = Ruleset.forBidding(this);

  let auction = new Auction();
  this.auction = auction;

  for (let player of sequence) {
    this.actor = player;
    await this.onturn(player, phase);

    do {
      var contract = await this.onbid(player, rules);
    } while (contract && !rules.isValid(contract));

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

  var lead = auction.lead();
  while (!auction.settled()) {
    await this.onbidded(lead);

    for (let player of auction.bidders()) {
      if (player == lead.owner) {
        continue;
      }

      this.actor = player;
      await this.onturn(player, phase);

      do {
        var contract = await this.onbid(player, rules);
      } while (contract && !rules.isValid(contract));

      if (contract) {
        contract.assign(player);
        auction.bid(contract);

        var lead = contract;
        await this.onbidded(lead);
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

  for (let player of sequence) {
    this.actor = player;
    await this.onturn(player, phase);

    do {
      var card = await this.onplay(player, trick, rules);
    } while (!rules.isValid(card));

    player.draw(card);

    if (trick.empty()) {
      contract.order.dominate(card.suit);
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

export async function countup({ players, trick, contract }) {
  let winner, highest = 0;

  for (let [player, card] of trick.plays) {
    let value = contract.order.valueOf(card);

    if (value > highest) {
      winner = player;
      highest = value;
    }
  }

  winner.points += trick.points();

  this.sequence = Player.sequence(players, winner);
  await this.oncompleted(trick, winner);

  return winner.cards.size > 0 ? playing : aftermath;
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

