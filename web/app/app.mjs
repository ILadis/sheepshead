
import './polyfill.mjs';
import { Client } from './client.mjs';
import * as Views from './views.mjs';

addEventListener('load', async () => {
  let params = new URLSearchParams(location.search);
  let id = Number(params.get('id') || 'NaN');
  let name = String(params.get('name') || 'Player');

  let shell = new Views.Shell();
  let dialog = new Views.Dialog();
  let toast = new Views.Toast();
  let trick = new Views.Trick();
  let hand = new Views.Hand();
  let left = new Views.Hand('left');
  let right = new Views.Hand('right');
  let top = new Views.Hand('top');
  let hands = { top, left, right, bottom: hand };

  shell.appendTo(document.body);

  shell.setTitle('Sheepshead');
  shell.setContents(trick, dialog, toast, hand, left, right, top);

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

  hand.onCardClicked = (card) => {
    client.playCard(card);
  };

  let stream = client.listenEvents();
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
    hand.setPlayer(self);
    hand.setCards(cards);

    if (phase == 'attendance' && self.isSameAs(player)) {
      dialog.setTitle('Participate in auction?');
      dialog.show();

      let options = dialog.withOptions();
      options.addItem('Yes', true);
      options.addItem('No', false);
      options.onItemSelected = async (attend) => {
        try {
          await client.attendAuction(attend);
          dialog.dismiss();
        } catch { }
      };
    }

    if (phase == 'auction' && self.isSameAs(player)) {
      dialog.setTitle('Choose what to play');
      dialog.show();

      let options = dialog.withOptions();
      let contracts = await client.fetchContracts();
      for (let contract of contracts) {
        let { name, suit } = contract;
        let label = name + (suit ? ` (${suit})` : '');
        options.addItem(label, contract);
      }

      options.onItemSelected = async (contract) => {
        try {
          await client.bidContract(contract);
          dialog.dismiss();
        } catch { }
      };
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

