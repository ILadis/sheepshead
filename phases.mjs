
import { Suits, Ranks, Points } from './card.mjs';
import { Deck } from './deck.mjs';
import { Order } from './order.mjs';
import { Trick } from './trick.mjs';
import { Player } from './player.mjs';

export async function Setup(game = {}) {
  let players = new Array();
  for (let index of [1, 2, 3, 4]) {
    let player = new Player(`Player #${index}`);
    players.push(player);
  }

  game.players = players;
  game.sequence = Player.sequence(players);

  return Shuffle;
}

export async function Shuffle(game) {
  let deck = new Deck();
  deck.fill();
  deck.shuffle();

  game.deck = deck;

  return Dealing;
}

export async function Dealing(game) {
  let deck = game.deck;
  for (let player of game.sequence) {
    let cards = deck.draw();
    player.cards.push(...cards);

    if (deck.empty()) {
      break;
    }
  }

  return Auction;
}

export async function Auction(game) {
  let order = new Order();
  order.promote([Suits.Heart], [Ranks.Sergeant, Ranks.Officer]);

  game.order = order;

  return Playing;
}

export async function Playing(game) {
  let trick = new Trick();
  let players = game.players;

  for (let player of game.sequence) {
    let card = await game.onplay(player, trick);

    if (trick.empty()) {
      game.order.dominant = card.suit;
    }

    trick.add(player, card);
    await game.onplayed(player, card, trick);

    if (trick.size() == players.length) {
      break;
    }
  }

  let winner = trick.winner(game.order);
  await game.onwon(winner, trick);

  game.sequence = Player.sequence(players, winner);

  if (winner.cards.length > 0) {
    return Playing;
  }
}

