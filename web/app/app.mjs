
import { Client } from './client.mjs';
import { Player } from './player.mjs';
import * as Views from './views.mjs';

addEventListener('load', async () => {
  let params = new URLSearchParams(location.search);
  let id = Number(params.get('id') || 'NaN');
  let name = String(params.get('name') || 'Player');

  let views = {
    players: new Views.Players(),
    cards: new Views.Cards(),
    trick: new Views.Trick()
  };

  views.players.appendTo(document.body);
  views.cards.appendTo(document.body);
  views.trick.appendTo(document.body);

  let client = await Client.forGame(id);

  let self = new Player(name);
  await client.join(self);

  views.cards.onclick = (card) => {
    client.play(card);
  };

  let stream = client.listen();
  stream.onjoined = (player) => {
    views.players.show(player);
  };

  stream.onturn = async (player, phase) => {
    views.players.show(player);
    views.players.setActive(player.index);

    let cards = await client.cards();
    views.cards.show(cards);
  };

  stream.onplayed = async (player, card) => {
    let cards = await client.trick();
    views.trick.show(cards);
  };
});

addEventListener('error', (err) => {
  alert(err);
});

