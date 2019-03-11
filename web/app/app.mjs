
import './polyfill.mjs';
import { Client } from './client.mjs';
import * as Views from './views.mjs';

addEventListener('load', async () => {
  let params = new URLSearchParams(location.search);
  let id = Number(params.get('id') || 'NaN');
  let name = String(params.get('name') || 'Player');

  let dialog = new Views.Dialog();
  let toast = new Views.Toast();
  let trick = new Views.Trick();
  let hand = new Views.Hand();
  let left = new Views.Hand('left');
  let right = new Views.Hand('right');
  let top = new Views.Hand('top');
  let hands = { top, left, right, bottom: hand };

  trick.appendTo(document.body);
  dialog.appendTo(document.body);
  toast.appendTo(document.body);
  hand.appendTo(document.body);
  left.appendTo(document.body);
  right.appendTo(document.body);
  top.appendTo(document.body);

  let client = await Client.forGame(id);
  let self = await client.joinGame(name);

  self.positionOf = function(other) {
    let index = this.index;
    for (let position of ['left', 'top', 'right', 'bottom']) {
      if ((++index % 4 || 4) === other.index) {
        return position;
      }
    }
  };
  self.isSameAs = function(other) {
    return this.index == other.index;
  };

  dialog.setTitle('Choose what to play');
  dialog.addOption('skip');
  dialog.onclick = async (contract) => {
    try {
      await client.bidContract(contract);
      dialog.dismiss();
    } catch { }
  };

  hand.onclick = (card) => {
    client.playCard(card);
  };

  let contracts = await client.fetchContracts();
  for (let contract of contracts) {
    let { label, suit } = contract;
    label += suit ? ` (${suit})` : '';
    dialog.addOption(label, contract);
  }

  let stream = client.listenStream();
  stream.onjoined = (player) => {
    let name = player.name;
    toast.makeText(`${name} joined the game`);

    let position = self.positionOf(player);
    hands[position].setPlayer(player);
  };

  stream.onturn = async ({ player, phase }) => {
    if (phase != 'proceed') {
      let name = player.name;
      toast.makeText(`It's ${name}'s turn`, 1000);
    }

    let active = self.positionOf(player);
    for (let position in hands) {
      hands[position].setActive(active == position);
    }

    if (!self.isSameAs(player)) {
      hands[active].setCards(player.cards);
    }

    let cards = await client.fetchCards();
    hand.setCards(cards);

    if (phase == 'auction' && self.isSameAs(player)) {
      dialog.show();
    }
  };

  stream.oncontested = (player) => {
    if (!self.isSameAs(player)) {
      let name = player.name;
      toast.makeText(`${name} wants to play`);
    }
  };

  stream.onplayed = async ({ player, card }) => {
    trick.addCard(card);

    let position = self.positionOf(player);
    hands[position].setCards(player.cards);
    hands[position].setPlayer(player);
  };

  stream.oncompleted = ({ winner, points }) => {
    toast.makeText(`${winner.name} wins +${points}`);
  };

  stream.onfinished = ({ winner, loser }) => {
    let { players, points } = winner;
    players = players.map(p => p.name).join(' and ');
    toast.makeText(`${players} won with ${points} points`, 5000);
  };
});

addEventListener('error', (err) => {
  alert(err);
});

