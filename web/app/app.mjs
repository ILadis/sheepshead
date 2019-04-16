
import './polyfill.mjs';
import { Client } from './client.mjs';
import { Shell } from './views.mjs';
import { Presenter } from './presenter.mjs';

addEventListener('load', async () => {
  let client = new Client();

  let shell = new Shell();
  shell.appendTo(document.body);

  let presenter = new Presenter(shell, client);
  presenter.showLobby();
});

