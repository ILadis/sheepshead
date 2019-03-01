
import './polyfill.mjs';
import { Client } from './client.mjs';
import * as Views from './views.mjs';

addEventListener('load', async () => {
  let params = new URLSearchParams(location.search);
  let id = Number(params.get('id') || 'NaN');
  let name = String(params.get('name') || 'Player');

  let toast = new Views.Toast();
  let trick = new Views.Trick();
  let hand = new Views.Hand();
  let left = new Views.Hand('left');
  let right = new Views.Hand('right');
  let top = new Views.Hand('top');
  let hands = { top, left, right, bottom: hand };

  toast.appendTo(document.body);
  trick.appendTo(document.body);
  hand.appendTo(document.body);
  left.appendTo(document.body);
  right.appendTo(document.body);
  top.appendTo(document.body);

  let client = await Client.forGame(id);
  let self = await client.joinGame(name);

  self.positionOf = function(other) {
    let index = this.index;
    for (let position of ['left', 'top', 'right']) {
      if ((++index % 4 || 4) === other.index) {
        return position;
      }
    }
    return 'bottom';
  };

  hand.onclick = (card) => {
    client.playCard(card);
  };

  let stream = client.listenStream();
  stream.onjoined = (player) => {
    let name = player.name;
    toast.makeText(`${name} joined the game`);

    let position = self.positionOf(player);
    hands[position].setPlayer(player);
  };

  stream.onturn = async ({ player, phase }) => {
    if (phase != 'playing') {
      return;
    }

    let name = player.name;
    toast.makeText(`It's ${name}'s turn`, 1000);

    let active = self.positionOf(player);
    for (let position in hands) {
      hands[position].setActive(active == position);
    }

    let cards = await client.fetchCards();
    hand.setCards(cards);
    hand.setPlayer(self);
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
    let names = players.map(p => p.name).join(' and ');
    toast.makeText(`${names} won with ${points} points`, 5000);
  };
});

addEventListener('error', (err) => {
  alert(err);
});

