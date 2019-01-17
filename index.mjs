
import { Game } from './game.mjs';
import { Card, Suits, Ranks } from './card.mjs';
import { Contract } from './contract.mjs';

let game = new Game();
let count = 0;

game.onbid = async function(player) {
  let contract = Contract.normal();
  let partner = Card[Suits.Leaf][Ranks.Ace];
  return { contract, partner };
};

game.onplay = async function(player) {
  let card = Array.from(player.cards)[0];
  if (player.draw(card)) {
    return card;
  }
};

game.onbidded = async function(contract) {
  console.log(`Contract #${contract.value} was agreed on`);
};

game.onplayed = async function(player, card) {
  let value = this.order.valueOf(card);
  console.log(`${player} played ${card} with value ${value}`);
};

game.onmatched = async function(contract) {
  let { owner, partner } = contract;
  console.log(`${owner} found his partner ${partner}`);
};

game.oncompleted = async function(trick, winner) {
  console.log(`Winner of this trick is: ${winner}`);
  console.log(`${winner} now has ${winner.points} point(s)`);
};

game.onfinished = async function(winner, looser) {
  let players = Array.from(winner).join(', ');
  console.log(`The following players won the round: ${players}`);
};

game.onproceed = async function(player) {
  return count++ < 4;
};

game.run();

