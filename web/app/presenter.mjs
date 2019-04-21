
import * as View from './views.mjs';

export function Presenter(shell, client) {
  this.shell = shell;
  this.client = client;
}

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
    fab: new View.FAButton('+'),
    toast: new View.Toast()
  });
  this.refreshGames();
};

Presenter.prototype.refreshGames = async function() {
  let { list, fab } = this.views;
  list.clearItems();

  let games = await this.client.listGames();
  for (let game of games) {
    let label = this.labelOf({ game });
    list.addItem(label, game);
  }

  list.setHint('There are currently no games available to join. '
    + 'Click the button below to create one.')

  fab.onClicked = () => this.createGame();
  list.onItemClicked = (game) => this.joinGame(game);
};

Presenter.prototype.createGame = async function() {
  try {
    let game = await this.client.createGame();
    this.joinGame(game);
  } catch (e) {
    this.showToast('Can not create game');
  }
};

Presenter.prototype.joinGame = async function(game) {
  let params = new URLSearchParams(location.search);
  let name = String(params.get('name') || 'Player');

  try {
    this.self = await this.client.joinGame(game, name);
    this.showGame();
  } catch (e) {
    this.showToast('Can not join game');
  }
};

Presenter.prototype.showGame = function() {
  this.showView('Sheepshead', {
    bottom: new View.Hand(),
    left: new View.Hand('left'),
    right: new View.Hand('right'),
    top: new View.Hand('top'),
    trick: new View.Trick(),
    dialog: new View.Dialog(),
    toast: new View.Toast()
  });
  this.listenEvents();
};

Presenter.prototype.listenEvents = function() {
  let stream = this.client.listenEvents();
  stream.onjoined = (player) => this.onJoined(player);
  stream.onturn = (turn) => this.onTurn(turn);
  stream.oncontested = (player) => this.onContested(player);
  stream.onbidded = (contract) => this.onBidded(contract);
  stream.onsettled = (contract) => this.onSettled(contract);
  stream.onplayed = (play) => this.onPlayed(play);
  stream.oncompleted = (result) => this.onCompleted(result);
  stream.onfinished = (result) => this.onFinished(result);
};

Presenter.prototype.onTurn = function({ player, phase }) {
  let dialog = this.views.dialog;
  dialog.dismiss();

  player.actor = true;
  this.refreshPlayers(player);

  switch (phase) {
  case 'attendance':
    this.refreshPlayers();
  case 'bidding':
    if (this.isSelf(player)) {
      this.listContracts();
    }
  }
};

Presenter.prototype.refreshPlayers = async function(player) {
  let players = new Array(player);
  if (!player) {
    players = await this.client.fetchPlayers();
  }

  let hands = this.views;
  for (let player of players) {
    let position = this.positionOf(player);
    let cards = player.cards;

    if (this.isSelf(player)) {
      cards = await this.client.fetchCards();
    }

    hands[position].setPlayer(player);
    hands[position].setCards(cards);
  }

  let bottom = this.views.bottom;
  bottom.onCardClicked = (card) => this.playCard(card);
};

Presenter.prototype.playCard = function(card) {
  this.client.playCard(card);
};

Presenter.prototype.listContracts = async function() {
  let dialog = this.views.dialog;
  let contracts = await this.client.fetchContracts();

  let options = dialog.withOptions();
  options.addItem('concede', { });
  for (let contract of contracts) {
    let label = this.labelOf({ contract });
    options.addItem(label, contract);
  }

  options.onItemSelected = (contract) => this.bidContract(contract);

  dialog.setTitle('Choose what to play');
  dialog.show();
};

Presenter.prototype.bidContract = function(contract) {
  this.client.bidContract(contract);
};

Presenter.prototype.onJoined = function(player) {
  this.showToast(`${player.name} joined the game`);
};

Presenter.prototype.onContested = function(player) {
  if (!this.isSelf(player)) {
    this.showToast(`${player.name} wants to play`);
  }
};

Presenter.prototype.onBidded = function(contract) {
  let player = contract.owner;
  if (!this.isSelf(player)) {
    let label = this.labelOf({ contract });
    this.showToast(`${player.name} wants to play ${label}`);
  }
};

Presenter.prototype.onSettled = function(contract) {
  let player = contract.owner;
  if (!this.isSelf(player)) {
    let label = this.labelOf({ contract });
    this.showToast(`${player.name} is playing ${label}`);
  }
};

Presenter.prototype.onPlayed = function({ player, card }) {
  this.views.trick.addCard(card);
  this.refreshPlayers(player);
};

Presenter.prototype.onCompleted = function({ winner, points }) {
  this.showToast(`${winner.name} wins +${points}`);
};

Presenter.prototype.onFinished = function({ winner }) {
  let { players, points } = winner;
  players = players.map(p => p.name).join(' and ');
  this.showToast(`${players} won with ${points} points`, 5000);
};

Presenter.prototype.labelOf = function(entity) {
  let contract = (entity) => {
    let { name, variant } = entity;
    let label = `${name}`;
    if (variant != 'default') {
      label += ` (${variant})`;
    }
    return label;
  };

  let game = (entity) => {
    let { id, players } = entity;
    let label = `Game #${id}`;
    if (players.length) {
      label += ` (${players.join(', ')})`;
    }
    return label;
  };

  let labels = { contract, game };
  for (let kind in entity) {
    if (labels[kind]) {
      return labels[kind](entity[kind]);
    }
  }
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

