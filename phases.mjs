
import { Deck } from './deck.mjs';
import { Trick } from './trick.mjs';
import { Player } from './player.mjs';
import { Result } from './result.mjs';

export async function joining() {
  let players = new Array();
  this.players = players;

  for (let index of [1, 2, 3, 4]) {
    let player = await this.onjoin(index);
    players.push(player);

    await this.onjoined(player);
  }

  this.sequence = Player.sequence(players);

  return shuffle;
}

export async function shuffle() {
  let deck = new Deck();
  deck.fill();
  deck.shuffle();

  this.deck = deck;

  return dealing;
}

export async function dealing({ deck, sequence }) {
  do {
    for (let player of sequence) {
      let cards = deck.draw();
      player.give(cards);
    }
  } while (!deck.empty());

  return auction;
}

export async function auction({ players, sequence }) {
  let contract, highest = 0;

  for (let player of sequence) {
    this.actor = player;

    let bid = await this.onbid(player);
    if (!bid) {
      continue;
    }

    let value = bid.value;
    if (value > highest) {
      contract = bid;
      highest = value;
    }
  }

  this.contract = contract;
  await this.onbidded(contract);

  return playing;
}

export async function playing({ contract, sequence }) {
  let trick = new Trick();
  this.trick = trick;

  for (let player of sequence) {
    this.actor = player;

    let card = await this.onplay(player, trick);
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

    if (value >= highest) {
      winner = player;
      highest = value;
    }
  }

  winner.points += trick.points();

  await this.oncompleted(trick, winner);
  this.sequence = Player.sequence(players, winner);

  return winner.cards.size > 0 ? playing : aftermath;
};

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
        break;
    }
    player.points = 0;
  }

  let { winner, loser } = Result.compare(declarer, defender);
  await this.onfinished(winner, loser);

  return proceed;
}

export async function proceed({ players }) {
  let proceed = true;
  for (let player of players) {
    this.actor = player;
    proceed = await this.onproceed(player) && proceed;
  }

  if (proceed) {
    return shuffle;
  }
};

