
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
  this.shell.setRefreshable(true);
  this.shell.refreshClicked = () => this.refreshGames();
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
    name = fallback;
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
  this.shell.setRefreshable(false);
  this.listenEvents();
  this.setupChat();
};

Presenter.prototype.listenEvents = function() {
  let stream = this.client.listenEvents();
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

  chat.addEmojis(0x1F601, 0x1F64F);

  chat.messageSubmitted = (message) => {
    chat.clearTypings();
    this.client.sendChatMessage(message);
  };
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
  this.views.trick.clearCards();
  let players = await this.client.fetchPlayers();
  this.refreshPlayers(...players);
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

Presenter.prototype.refreshPlayers = function(...players) {
  let { left, top, right, bottom } = this.views;
  for (let hand of [left, top, right, bottom]) {
    hand.setActor(false);
  }

  bottom.cardClicked = (card) => {
    this.client.playCard(card);
  };

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
};

Presenter.prototype.gameFinished = function({ winner }) {
  let names = winner.players.map(p => p.name);
  let message = this.stringFor('finished-toast',
    names, winner.points, winner.score);

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
      this.stringFor('standings-total'),
    ];

    let table = dialog.withTable();
    table.addRow('№', ...labels);

    let position = 0;
    for (let player of players) {
      table.addRow(++position, player.name, player.score, player.total);
    }

    let title = this.stringFor('standings-title');
    dialog.setTitle(title);

    let label = this.stringFor('leave-game-action');
    dialog.addAction(label, () => {
      this.client.leaveGame().then(() => this.showLobby());
    });

    dialog.show();
  }
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
    var self = this.isSelf(player);
    chat.addMessage(message, player, self);
  }
};

Presenter.prototype.isSelf = function(other) {
  return other && this.self.index == other.index;
};

Presenter.prototype.positionOf = function(other) {
  let index = this.self.index;
  for (let position of ['left', 'top', 'right', 'bottom']) {
    if ((++index % 4 || 4) === other.index) {
      return position;
    }
  }
};

Presenter.prototype.stringFor = function(name, ...args) {
  return this.strings.get(name, ...args);
};

