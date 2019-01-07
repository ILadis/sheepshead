
import { Suits, Ranks } from './card.mjs';
import { Deck } from './deck.mjs';
import { Order } from './order.mjs';
import { Trick } from './trick.mjs';
import { Player } from './player.mjs';

export async function setup(game) {
  let players = new Array();
  for (let index of [1, 2, 3, 4]) {
    let player = new Player(`Player #${index}`);
    players.push(player);
  }

  game.players = players;
  game.sequence = Player.sequence(players);

  return shuffle;
}

export async function shuffle(game) {
  let deck = new Deck();
  deck.fill();
  deck.shuffle();

  game.deck = deck;

  return dealing;
}

export async function dealing(game) {
  let deck = game.deck;

  do {
    for (let player of game.sequence) {
      let cards = deck.draw();
      player.cards.push(...cards);
    }
  } while (!deck.empty());

  return auction;
}

export async function auction(game) {
  let contracts = new Array();
  let players = game.players;

  for (let player of game.sequence) {
    let bid = await game.onbid(player);
    if (bid) {
      let { contract, partner } = bid;
      contract.assign(player, partner);
      contracts.push(contract);
    }
  }

  let highest = (c1, c2) => c1.value >= c2.value ? c1 : c2;
  let contract = contracts.reduce(highest);

  game.contract = contract;
  game.order = contract.order;

  await game.onbidded(contract);

  return playing;
}

export async function playing(game) {
  let trick = new Trick();
  let players = game.players;
  let contract = game.contract;
  let order = game.order;

  game.trick = trick;

  for (let player of game.sequence) {
    let card = await game.onplay(player, trick);

    if (trick.empty()) {
      order.dominant = card.suit;
    }

    if (contract.partner === card) {
      contract.partner = player;
      await game.onmatched(contract);
    }

    trick.add(player, card);
    await game.onplayed(player, card, trick);
  }

  let winner = trick.winner(game.order);
  winner.points += trick.points();

  await game.oncompleted(trick, winner);

  game.sequence = Player.sequence(players, winner);

  if (winner.cards.length > 0) {
    return playing;
  }
}

