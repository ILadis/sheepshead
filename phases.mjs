
import { Deck } from './deck.mjs';
import { Trick } from './trick.mjs';
import { Player } from './player.mjs';

export async function joining() {
  let players = new Array();
  for (let index of [1, 2, 3, 4]) {
    let player = await this.onjoin(index);
    players.push(player);

    await this.onjoined(player);
  }

  this.actor = null;
  this.players = players;
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
  let contracts = new Array();

  for (let player of sequence) {
    this.actor = player;

    let contract = await this.onbid(player);
    if (contract) {
      contracts.push(contract);
    }
  }

  let highest = (c1, c2) => c1.value >= c2.value ? c1 : c2;
  let contract = contracts.reduce(highest);

  this.contract = contract;
  this.order = contract.order;

  await this.onbidded(contract);

  return playing;
}

export async function playing({ players, contract, sequence }) {
  let trick = new Trick();
  let order = contract.order;

  this.trick = trick;
  for (let player of sequence) {
    this.actor = player;

    let card = await this.onplay(player, trick);
    if (trick.empty()) {
      order.dominant = card.suit;
    }

    trick.add(player, card);
    await this.onplayed(player, card, trick);

    if (contract.partner == card) {
      contract.partner = player;
      await this.onmatched(contract);
    }
  }

  let winner = trick.winner(order);
  winner.points += trick.points();

  await this.oncompleted(trick, winner);
  this.sequence = Player.sequence(players, winner);

  return winner.cards.size > 0 ? playing : counting;
}

export async function counting({ players, contract }) {
  let declarer = new Set();
  declarer.points = 0;

  let defender = new Set();
  defender.points = 0;

  let candidate;
  if (!contract.owner) {
    let highest = (p1, p2) => p1.points >= p2.points ? p1 : p2;
    candidate = players.reduce(highest);
  }

  for (let player of players) {
    switch (player) {
      case candidate:
      case contract.owner:
      case contract.partner:
        declarer.add(player);
        declarer.points += player.points;
        break;
      default:
        defender.add(player);
        defender.points += player.points;
    }
    player.points = 0;
  }

  let winner = declarer, loser = defender;
  if (!candidate && declarer.points <= defender.points) {
    winner = defender;
    looser = declarer;
  }

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

