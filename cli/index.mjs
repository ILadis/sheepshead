
import TTY from 'readline';

import { Game } from '../game.mjs';
import { Card, Suits, Ranks } from '../card.mjs';
import { Player } from '../player.mjs';
import { Contract } from '../contract.mjs';

let game = new Game();
let tty = TTY.createInterface({
  input: process.stdin,
  output: process.stdout
});

game.onjoin = async function(index) {
  return new Player(`Player #${index}`);
};

game.onbid = async function(player) {
  return Contract.normal();
};

game.onbidded = async function(contract) {
  tty.write(`Trumps are: Hearts, Seargants and Officers\n`);
};

game.onplay = function(player) {
  let order = game.contract.order;
  let cards = Array.from(player.cards);

  let valuable = (c1, c2) => order.valueOf(c1) - order.valueOf(c2);
  cards.sort(valuable);

  tty.write(`\nIt's ${player}'s turn, select a card to play:\n`);

  let index = 0;
  for (let card of cards) {
    tty.write(`[${index++}] - ${card}\n`);
  }

  return new Promise((resolve) => {
    tty.question(`\n> `, (index) => {
      let card = cards[Number(index)];
      if (player.draw(card)) {
        resolve(card);
      }
    });
  });
};

game.onplayed = async function(player, card) {
  let trick = game.trick.cards().join(', ');
  tty.write(`\n${player} played ${card}\n`);
  tty.write(`Trick now consists of: ${trick}\n`);
};

game.oncompleted = async function(trick, winner) {
  tty.write(`Winner of this trick is: ${winner}\n`);
  tty.write(`${winner} now has ${winner.points} point(s)\n`);
};

game.onfinished = async function(winner, loser) {
  let players = Array.from(winner).join(', ');
  tty.write(`\nThe following player(s) won the round: ${players}\n`);
};

game.onproceed = async function(player) {
  return false;
};

game.run();

