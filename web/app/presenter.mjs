
import * as View from './views.mjs';

export function Presenter(shell, client, strings) {
  this.shell = shell;
  this.client = client;
  this.strings = strings;
}

Presenter.prototype.stringFor = function(name, ...args) {
  return this.strings.get(name, ...args);
};

Presenter.prototype.showView = function(title, views) {
  this.shell.setTitle(title);
  this.shell.setContents(views);
  this.views = views;
};

Presenter.prototype.showToast = function(text, duration) {
  let toast = this.views.toast;
  toast.makeText(text, duration);
};

Presenter.prototype.showLobby = function() {
  let title = this.stringFor('lobby-title');
  this.showView(title, {
    name: new View.Textfield(),
    list: new View.List(),
    fab: new View.Button(),
    toast: new View.Toast()
  });
  this.refreshGames();
  this.changePlayerName();
};

Presenter.prototype.refreshGames = async function() {
  let { list, fab } = this.views;
  list.clearItems();

  let games = await this.client.listGames();
  for (let game of games) {
    let { id, players } = game;
    let label = this.stringFor('game-label', id, players);
    list.addItem(label, game);
  }

  let hint = this.stringFor('no-games-hint');
  list.setHint(hint);

  fab.onClicked = () => this.createGame();
  list.onItemClicked = (game) => this.joinGame(game);
};

Presenter.prototype.changePlayerName = function(name) {
  let fallback = this.stringFor('player-name-fallback');
  let label = this.stringFor('player-name-input');

  if (!name || !name.length) {
    name = fallback;
  }

  let view = this.views.name;
  if (view) {
    view.setLabel(label);
    view.setValue(name);

    view.onValueChange = (name) => this.playerName = name;
  }

  this.playerName = name;
};

Presenter.prototype.createGame = async function() {
  try {
    let game = await this.client.createGame();
    this.joinGame(game);
  } catch (e) {
    let message = this.stringFor('create-game-error');
    this.showToast(message);
  }
};

Presenter.prototype.joinGame = async function(game) {
  let name = this.playerName;

  try {
    this.self = await this.client.joinGame(game, name);
    this.showGame();
  } catch (e) {
    let message = this.stringFor('join-game-error');
    this.showToast(message);
  }
};

Presenter.prototype.showGame = function() {
  let title = this.stringFor('game-title');
  this.showView(title, {
    trick: new View.Trick(),
    bottom: new View.Hand(),
    left: new View.Hand(),
    right: new View.Hand(),
    top: new View.Hand(),
    dialog: new View.Dialog(),
    toast: new View.Toast()
  });
  this.listenEvents();
};

Presenter.prototype.listenEvents = function() {
  let stream = this.client.listenEvents();
  stream.onjoined = (player) => this.onJoined(player);
  stream.ondealt = () => this.onDealt();
  stream.onturn = (turn) => this.onTurn(turn);
  stream.oncontested = (player) => this.onContested(player);
  stream.onbidded = (contract) => this.onBidded(contract);
  stream.onsettled = (contract) => this.onSettled(contract);
  stream.onplayed = (play) => this.onPlayed(play);
  stream.oncompleted = (result) => this.onCompleted(result);
  stream.onfinished = (result) => this.onFinished(result);
};

Presenter.prototype.onJoined = function(player) {
  let message = this.stringFor('joined-game-toast', player.name);
  this.showToast(message);
};

Presenter.prototype.onDealt = async function() {
  let players = await this.client.fetchPlayers();
  this.refreshPlayers(...players);
};

Presenter.prototype.onTurn = function({ player, phase }) {
  let dialog = this.views.dialog;
  dialog.dismiss();

  player.actor = true;
  this.refreshPlayers(player);

  switch (phase) {
  case 'attendance':
  case 'bidding':
    if (this.isSelf(player)) {
      this.listContracts(phase);
    }
  }
};

Presenter.prototype.refreshPlayers = function(...players) {
  let { left, top, right, bottom } = this.views;
  for (let hand of [left, top, right, bottom]) {
    hand.setActor(false);
  }

  bottom.onCardClicked = (card) => this.playCard(card);

  let hands = this.views;
  for (let player of players) {
    let position = this.positionOf(player);
    let hand = hands[position];

    hand.setPosition(position);
    hand.setPlayer(player);

    let cards = player.cards;
    if (this.isSelf(player)) {
      this.client.fetchCards().then((cards) => {
        hand.setCards(cards);
      });
    } else {
      hand.setCards(cards);
    }
  }
};

Presenter.prototype.playCard = function(card) {
  this.client.playCard(card);
};

Presenter.prototype.listContracts = async function(phase) {
  let dialog = this.views.dialog;
  let contracts = await this.client.fetchContracts();

  let options = dialog.withOptions();

  let concede = this.stringFor('concede-label');
  options.addItem(concede, { });
  for (let contract of contracts) {
    let { name, variant } = contract;
    let label = this.stringFor('contract-label', name, variant);
    options.addItem(label, contract);
  }

  options.onItemSelected = (contract) => this.bidContract(contract);

  let title = this.stringFor('contract-title', phase);
  dialog.setTitle(title);
  dialog.show();
};

Presenter.prototype.bidContract = function(contract) {
  let dialog = this.views.dialog;
  this.client.bidContract(contract).then(() => {
    dialog.dismiss();
  });
};

Presenter.prototype.onContested = function(player) {
  if (!this.isSelf(player)) {
    this.showToast(this.stringFor('contested-toast', player.name));
  }
};

Presenter.prototype.onBidded = function(contract) {
  let player = contract.owner;
  if (!this.isSelf(player)) {
    this.showToast(this.stringFor('bidded-toast',
      player.name, contract.name, contract.variant));
  }
};

Presenter.prototype.onSettled = async function(contract) {
  let player = contract.owner;
  if (!this.isSelf(player)) {
    this.showToast(this.stringFor('settled-toast',
      player.name, contract.name, contract.variant));
  }

  let players = await this.client.fetchPlayers();
  this.refreshPlayers(...players);
};

Presenter.prototype.onPlayed = function({ player, card }) {
  let position = this.positionOf(player);
  this.views.trick.addCard(card, position);
  this.refreshPlayers(player);
};

Presenter.prototype.onCompleted = function({ winner, points }) {
  let message = this.stringFor('trick-completed-toast', winner.name, points);
  this.showToast(message);
};

Presenter.prototype.onFinished = function({ winner }) {
  let { players, points, score } = winner;
  let names = players.map(p => p.name);
  let message = this.stringFor('finished-toast', names, points, score);
  this.showToast(message, 5000);
  this.showStandings();
};

Presenter.prototype.showStandings = async function() {
  let { dialog, trick } = this.views;
  let players = await this.client.fetchPlayers();

  let labels = [
    this.stringFor('standings-player'),
    this.stringFor('standings-score')
  ];

  let table = dialog.withTable();
  table.addRow('№', ...labels);

  let position = 0;
  for (let player of players) {
    table.addRow(++position, player.name, player.score);
  }

  let title = this.stringFor('standings-title');
  dialog.setTitle(title);

  setTimeout(() => {
    dialog.show();
    trick.clearCards();
  }, 2000);
};

Presenter.prototype.isSelf = function(other) {
  return this.self.index == other.index;
};

Presenter.prototype.positionOf = function(other) {
  let index = this.self.index;
  for (let position of ['left', 'top', 'right', 'bottom']) {
    if ((++index % 4 || 4) === other.index) {
      return position;
    }
  }
};

