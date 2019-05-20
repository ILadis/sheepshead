
import './polyfill.mjs';
import { Client } from './client.mjs';
import { Shell } from './views.mjs';
import { Presenter } from './presenter.mjs';

addEventListener('load', async () => {
  let client = new Client();

  let shell = new Shell();
  document.body.appendChild(shell.node);

  let presenter = new Presenter(shell, client);
  presenter.showLobby();
});

