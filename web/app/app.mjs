
import { Client } from './client.mjs';
import * as Views from './views.mjs';

addEventListener('load', async () => {
  let params = new URLSearchParams(location.search);
  let id = Number(params.get('id') || 'NaN');
  let name = String(params.get('name') || 'Player');

  let views = {
    players: new Views.Players(),
    hand: new Views.Hand(),
    trick: new Views.Trick()
  };

  views.players.appendTo(document.body);
  views.trick.appendTo(document.body);
  views.hand.appendTo(document.body);

  let client = await Client.forGame(id);
  let self = await client.join(name);

  views.hand.onclick = (card) => {
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
    views.hand.setCards(cards);
  };

  stream.onplayed = async (player, card) => {
    let cards = await client.trick();
    views.trick.setCards(cards);
  };
});

addEventListener('error', (err) => {
  alert(err);
});

