
import * as View from './views.mjs';

export function Presenter(shell, client, strings) {
  this.shell = shell;
  this.client = client;
  this.strings = strings;
}

Presenter.prototype.showView = function(title, ...sections) {
  let shell = this.shell;

  shell.setTitle(title);
  shell.clearSections();

  this.views = Object.create(null);

  for (let [name, views] of sections) {
    let section = shell.newSection(name);

    for (let name in views) {
      let view = views[name];
      section.addView(view);

      this.views[name] = view;
    }
  }
};

Presenter.prototype.showLobby = function() {
  let title = this.stringFor('lobby-title');
  this.showView(title,
    ['lobby', {
      name: new View.Textfield(),
      list: new View.List(),
      fab: new View.Button(),
      toast: new View.Toast()
    }]
  );
  let refresh = this.shell.newAction('refresh');
  refresh.clicked = () => this.refreshGames();

  let github = this.shell.newAction('github');
  github.clicked = () => this.redirectTo('https://github.com/ILadis/sheepshead');

  this.refreshGames(true);
  this.changePlayerName();
};

Presenter.prototype.refreshGames = async function(initial) {
  let { list, fab } = this.views;
  let games = await this.client.listGames();

  if (!initial) {
    var hint = this.stringFor('refreshed-games-toast');
    this.showToast(hint, 1500);
  }

  list.setHint();
  list.clearItems();

  for (let game of games) {
    let { id, players } = game;
    let label = this.stringFor('game-label', id, players);
    list.addItem(label, game);
  }

  var hint = this.stringFor('no-games-hint');
  list.setHint(hint);

  fab.clicked = () => this.createGame();
  list.itemClicked = (game) => this.joinGame(game);
};

Presenter.prototype.changePlayerName = function(name) {
  let fallback = this.stringFor('player-name-fallback');
  let label = this.stringFor('player-name-input');

  if (!name || !name.length) {
    name = this.playerName || fallback;
  }

  let view = this.views.name;
  if (view) {
    view.setLabel(label);
    view.setValue(name);

    view.valueChange = (name) => this.playerName = name;
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
  let spectate = game.players.length == 4;
  let name = this.playerName;

  if (spectate) {
    this.client.spectateGame(game);
    this.showGame();
  }

  else try {
    this.self = await this.client.joinGame(game, name);
    this.showGame();
  } catch (e) {
    let message = this.stringFor('join-game-error');
    this.showToast(message);
  }
};

Presenter.prototype.showGame = function() {
  let title = this.stringFor('game-title');
  this.showView(title,
    ['game', {
      trick: new View.Trick(),
      bottom: new View.Hand(),
      left: new View.Hand(),
      right: new View.Hand(),
      top: new View.Hand(),
      dialog: new View.Dialog(),
      toast: new View.Toast()
    }],
    ['drawer', {
      chat: new View.Chat()
    }]
  );
  this.shell.clearActions();
  this.listenEvents();
  this.setupChat();
  this.refreshPlayers();
};

Presenter.prototype.listenEvents = function() {
  let stream = this.stream = this.client.listenEvents(true);
  stream.onchat = (chat) => this.chatMessageReceived(chat);
  stream.onjoined = (player) => this.playerJoined(player);
  stream.ondealt = () => this.cardsDealt();
  stream.onturn = (turn) => this.playerTurn(turn);
  stream.oncontested = (player) => this.auctionContested(player);
  stream.onbidded = (contract) => this.contractBidded(contract);
  stream.onsettled = (contract) => this.contractSettled(contract);
  stream.onplayed = (play) => this.cardPlayed(play);
  stream.onmatched = (match) => this.partiesMatched(match);
  stream.oncompleted = (result) => this.trickCompleted(result);
  stream.onfinished = (result) => this.gameFinished(result);
};

Presenter.prototype.setupChat = function() {
  let chat = this.views.chat;

  let placeholder = this.stringFor('chat-typings-placeholder');
  chat.setTypingsPlaceholder(placeholder);

  var label = this.stringFor('chat-emoji-smileys-label');
  chat.addEmojis([0x1F601, 0x1F64F, 0x1F600, 0x1F636], label);

  var label = this.stringFor('chat-emoji-symbols-label');
  chat.addEmojis([0x1F493, 0x1F52E], label);

  chat.messageSubmitted = (message) => this.sendChatMessage(message);
};

Presenter.prototype.sendChatMessage = function(message) {
  if (!this.isSpectator()) {
    let chat = this.views.chat;
    chat.clearTypings();

    this.client.sendChatMessage(message);
  }
};

Presenter.prototype.chatMessageReceived = function({ message, player }) {
  this.showChatMessage(message, player);
};

Presenter.prototype.playerJoined = function(player) {
  let message = this.stringFor('joined-game-toast', player.name);
  this.showToast(message);
  this.showChatMessage(message);
};

Presenter.prototype.cardsDealt = async function() {
  this.refreshPlayers();
};

Presenter.prototype.playerTurn = function({ player, phase }) {
  this.phase = phase;
  this.views.dialog.dismiss();

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

Presenter.prototype.refreshPlayers = async function(...players) {
  if (!players.length) {
    players = await this.client.fetchPlayers();
  }

  let { left, top, right, bottom } = this.views;
  bottom.cardClicked = (card) => this.playCard(card);

  for (let hand of [left, top, right, bottom]) {
    hand.setActor(false);
  }

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
  if (!this.isSpectator()) {
    this.client.playCard(card);
  }
};

Presenter.prototype.listContracts = async function(phase) {
  let contracts = await this.client.fetchContracts();

  if (this.phase === phase) {
    let dialog = this.views.dialog;
    let options = dialog.withOptions();

    let concede = this.stringFor('concede-label');
    options.addItem(concede);
    for (let contract of contracts) {
      let { name, variant } = contract;
      let label = this.stringFor('contract-label', name, variant);
      options.addItem(label, contract);
    }

    options.itemSelected = (contract) => this.bidContract(contract, phase);

    let title = this.stringFor('contract-title', phase);
    dialog.setTitle(title);
    dialog.show();
  }
};

Presenter.prototype.bidContract = async function(contract, phase) {
  await this.client.bidContract(contract);

  if (this.phase === phase) {
    let dialog = this.views.dialog;
    dialog.dismiss();
  }
};

Presenter.prototype.auctionContested = function(player) {
  let message = this.stringFor('contested-toast', player.name);

  this.showChatMessage(message);
  if (!this.isSelf(player)) {
    this.showToast(message);
  }
};

Presenter.prototype.contractBidded = function(contract) {
  let player = contract.owner;
  let message = this.stringFor('bidded-toast',
    player.name, contract.name, contract.variant);

  this.showChatMessage(message);
  if (!this.isSelf(player)) {
    this.showToast(message);
  }
};

Presenter.prototype.contractSettled = async function(contract) {
  let player = contract.owner;
  let message = this.stringFor('settled-toast',
    player.name, contract.name, contract.variant);

  this.showChatMessage(message);
  if (!this.isSelf(player)) {
    this.showToast(message);
  }

  let players = await this.client.fetchPlayers();
  this.refreshPlayers(...players);
};

Presenter.prototype.cardPlayed = function({ player, card }) {
  let position = this.positionOf(player);
  this.views.trick.addCard(card, position);
  this.refreshPlayers(player);
};

Presenter.prototype.partiesMatched = function({ owner, partner }) {
  let message = this.stringFor('matched-toast',
    owner.name, partner.name);
  this.showChatMessage(message);
};

Presenter.prototype.trickCompleted = function({ winner, points }) {
  let message = this.stringFor('trick-completed-toast',
    winner.name, points);
  this.showToast(message);

  let position = this.positionOf(winner);
  setTimeout(() => this.views.trick.clearCards(position), 1000);
};

Presenter.prototype.gameFinished = function({ winner }) {
  let names = winner.players.map(p => p.name);
  let message = this.stringFor('finished-toast',
    names, winner.points);

  this.phase = null;
  this.showToast(message, 5000);

  setTimeout(() => this.listStandings(), 2000);
};

Presenter.prototype.listStandings = async function() {
  let players = await this.client.fetchScores();

  if (this.phase === null) {
    let dialog = this.views.dialog;

    let labels = [
      this.stringFor('standings-player'),
      this.stringFor('standings-score'),
      this.stringFor('standings-wins'),
    ];

    let table = dialog.withTable();
    table.addRow('№', ...labels);

    let position = 0;
    for (let player of players) {
      table.addRow(++position, player.name, player.score, player.wins);
    }

    let title = this.stringFor('standings-title');
    dialog.setTitle(title);

    let label = this.stringFor('leave-game-action');
    dialog.addAction(label, () => this.leaveGame());

    dialog.show();
  }
};

Presenter.prototype.leaveGame = async function() {
  if (!this.isSpectator()) {
    await this.client.leaveGame();
  }
  this.stream.close();

  this.stream = null;
  this.self = null;

  this.showLobby();
};

Presenter.prototype.showToast = function(text, duration) {
  let toast = this.views.toast;
  if (toast) {
    toast.makeText(text, duration);
  }
};

Presenter.prototype.showChatMessage = function(message, player) {
  let chat = this.views.chat;
  if (chat) {
    let self = this.isSelf(player);
    chat.addMessage(message, player, self);
  }
};

Presenter.prototype.isSpectator = function() {
  return Boolean(!this.self && this.stream);
};

Presenter.prototype.isSelf = function(other) {
  return Boolean(other && this.self && this.self.index == other.index);
};

Presenter.prototype.positionOf = function(other) {
  let index = this.self ? this.self.index : 1;
  for (let position of ['left', 'top', 'right', 'bottom']) {
    if ((++index % 4 || 4) === other.index) {
      return position;
    }
  }
};

Presenter.prototype.redirectTo = function(url) {
  window.location.href = url;
};

Presenter.prototype.stringFor = function(name, ...args) {
  return this.strings.get(name, ...args);
};

