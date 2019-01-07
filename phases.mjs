
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
  for (let player of game.sequence) {
    let cards = deck.draw();
    player.cards.push(...cards);

    if (deck.empty()) {
      break;
    }
  }

  return auction;
}

export async function auction(game) {
  let order = new Order();
  order.promote([Suits.Heart], [Ranks.Sergeant, Ranks.Officer]);

  game.order = order;

  return playing;
}

export async function playing(game) {
  let trick = new Trick();
  let players = game.players;

  game.trick = trick;

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
  winner.points += trick.points();

  await game.oncompleted(trick, winner);

  game.sequence = Player.sequence(players, winner);

  if (winner.cards.length > 0) {
    return playing;
  }
}

