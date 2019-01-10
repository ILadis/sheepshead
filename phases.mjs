
import { Suits, Ranks } from './card.mjs';
import { Deck } from './deck.mjs';
import { Order } from './order.mjs';
import { Trick } from './trick.mjs';
import { Player } from './player.mjs';

export async function setup() {
  let players = new Array();
  for (let index of [1, 2, 3, 4]) {
    let player = new Player(`Player #${index}`);
    players.push(player);
  }

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
      player.cards.push(...cards);
    }
  } while (!deck.empty());

  return auction;
}

export async function auction({ players, sequence }) {
  let contracts = new Array();

  for (let player of sequence) {
    let bid = await this.onbid(player);
    if (bid) {
      let { contract, partner } = bid;
      contract.assign(player, partner);
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

  for (let player of sequence) {
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

  return winner.cards.length > 0 ? playing : counting;
}

export async function counting({ players, contract }) {
  let declarer = new Set();
  declarer.points = 0;

  let defender = new Set();
  defender.points = 0;

  for (let player of players) {
    switch (player) {
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

  let winner = declarer, looser = defender;
  if (declarer.points <= defender.points) {
    winner = defender;
    looser = declarer;
  }

  await this.onfinished(winner, looser);
  return proceed;
}

export async function proceed({ players }) {
  let proceed = true;
  for (let player of players) {
    proceed = proceed && await this.onproceed(player);
  }

  if (proceed) {
    return shuffle;
  }
};

