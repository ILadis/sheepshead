
import { Client } from './client.mjs';
import * as Views from './views.mjs';

addEventListener('load', async () => {
  let params = new URLSearchParams(location.search);
  let id = Number(params.get('id') || 'NaN');
  let name = String(params.get('name') || 'Player');

  let views = {
    players: new Views.Players(),
    hand: new Views.Hand(),
    trick: new Views.Trick(),
    toast: new Views.Toast()
  };

  views.toast.appendTo(document.body);
  views.players.appendTo(document.body);
  views.trick.appendTo(document.body);
  views.hand.appendTo(document.body);

  let client = await Client.forGame(id);
  let self = await client.joinGame(name);

  views.hand.onclick = (card) => {
    client.playCard(card);
  };

  let stream = client.listenStream();
  stream.onjoined = (player) => {
    views.players.setPlayer(player);
  };

  stream.onturn = async (player, phase) => {
    views.players.setPlayer(player);
    views.players.setActive(player.index);

    let cards = await client.fetchCards();
    views.hand.setCards(cards);
  };

  stream.onplayed = async (player, card) => {
    views.trick.addCard(card);
  };

  stream.oncompleted = (winner, points) => {
    views.toast.showText(`${winner.name} wins +${points}`);
  };

  stream.onfinished = (winner, loser) => {
    let { players, points } = winner;
    let names = players.map(p => p.name).join(' and ');
    views.toast.showText(`${names} won with ${points} points`);
  };
});

addEventListener('error', (err) => {
  alert(err);
});

