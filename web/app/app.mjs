
import './polyfill.mjs';
import { Client } from './client.mjs';
import { Shell } from './views.mjs';
import { Presenter } from './presenter.mjs';
import { Strings } from './strings.mjs';

addEventListener('load', () => {
  let params = new URLSearchParams(location.search);
  let name = String(params.get('name') || '');

  let client = new Client();

  let shell = new Shell();
  document.body.appendChild(shell.node);

  let strings = Strings.forLanguage(navigator.language);

  let presenter = new Presenter(shell, client, strings);
  presenter.showLobby();
  presenter.changePlayerName(name);
});

