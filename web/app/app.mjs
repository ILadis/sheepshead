
import './polyfill.mjs';
import { Client } from './client.mjs';
import { Shell } from './views.mjs';
import { Presenter } from './presenter.mjs';

let presenter;

addEventListener('load', async () => {
  let params = new URLSearchParams(location.search);
  let id = Number(params.get('id') || 'NaN');
  let name = String(params.get('name') || 'Player');

  let client = await Client.forGame(id);
  let self = await client.joinGame(name);

  let shell = new Shell();
  shell.appendTo(document.body);

  presenter = new Presenter(shell, client);
  presenter.showGame(self);
});

addEventListener('error', (err) => {
  presenter.showError(err);
});

