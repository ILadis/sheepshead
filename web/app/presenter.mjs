
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
  this.showView('Lobby', {
    list: new View.List(),
    fab: new View.Button(),
    toast: new View.Toast()
  });
  this.refreshGames();
};

Presenter.prototype.refreshGames = async function() {
  let { list, fab } = this.views;
  list.clearItems();

  let games = await this.client.listGames();
  for (let game of games) {
    let label = this.labelOf(game);
    list.addItem(label, game);
  }

  let hint = this.stringFor('no-games-hint');
  list.setHint(hint);

  fab.setLabel('+');
  fab.onClicked = () => this.createGame();
  list.onItemClicked = (game) => this.joinGame(game);
};

Presenter.prototype.createGame = async function() {
  try {
    let game = await this.client.createGame();
    this.joinGame(game);
  } catch (e) {
    this.showToast(this.stringFor('create-game-error'));
  }
};

Presenter.prototype.joinGame = async function(game) {
  let params = new URLSearchParams(location.search);
  let name = String(params.get('name') || 'Player');

  try {
    this.self = await this.client.joinGame(game, name);
    this.showGame();
  } catch (e) {
    this.showToast(this.stringFor('join-game-error'));
  }
};

Presenter.prototype.showGame = function() {
  this.showView('Sheepshead', {
    bottom: new View.Hand(),
    left: new View.Hand(),
    right: new View.Hand(),
    top: new View.Hand(),
    trick: new View.Trick(),
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
  this.showToast(this.stringFor('joined-game-toast', player.name));
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
  this.client.bidContract(contract);
};

Presenter.prototype.onContested = function(player) {
  if (!this.isSelf(player)) {
    this.showToast(this.stringFor('contested-toast', player.name));
  }
};

Presenter.prototype.onBidded = function(contract) {
  let player = contract.owner;
  if (!this.isSelf(player)) {
    this.showToast(this.strings.get('bidded-toast',
      player.name, contract.name, contract.variant));
  }
};

Presenter.prototype.onSettled = function(contract) {
  let player = contract.owner;
  if (!this.isSelf(player)) {
    let { name, variant } = contract;
    let label = this.strings.get('contract-label', name, variant);
    this.showToast(`${player.name} is playing ${label}`);
  }
};

Presenter.prototype.onPlayed = function({ player, card }) {
  this.views.trick.addCard(card);
  this.refreshPlayers(player);
};

Presenter.prototype.onCompleted = function({ winner, points }) {
  let text = this.strings.get('trick-completed-toast', winner.name, points);
  this.showToast(text);
};

Presenter.prototype.onFinished = function({ winner }) {
  let { players, points } = winner;
  players = players.map(p => p.name).join(' and ');
  this.showToast(`${players} won with ${points} points`, 5000);
};

Presenter.prototype.labelOf = function(game) {
  let { id, players } = game;
  let label = `Game #${id}`;
  if (players.length) {
    label += ` (${players.join(', ')})`;
  }
  return label;
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

