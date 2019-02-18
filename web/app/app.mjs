import { Client }  from './client.mjs';
import { Player }  from './player.mjs';
import * as Views  from './views.mjs';
//import Presenter from './presenter.mjs';
//import Repository from './repository.mjs';

addEventListener('load', async () => {
  window.Client = Client;

  let view = new Views.PlayerList();
  view.appendTo(document.body);

  let client = await Client.forGame(null);

  let player = new Player('Player 1');
  await client.join(player);
  alert(`we are ${player} with token ${client.token}`);

  let players = await client.players();
  alert(`${players} are currently connected`);

  let stream = client.listen();
  stream.onjoined = (player) => {
    alert(`joined: ${player}`);
    view.add(player);
  };
  stream.onturn = (player, phase) => {
    alert(`turn: ${player}, ${phase}`);
  };
  stream.onplayed = (player, card) => {
    alert(`played: ${player}, ${card}`);
  };
});

addEventListener('error', (err) => {
  alert(err);
});

