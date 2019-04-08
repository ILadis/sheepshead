
import * as View from './views.mjs';

export function Presenter(shell, client) {
  this.shell = shell;
  this.client = client;
}

Presenter.prototype.showError = function(error) {
  alert(error);
};

Presenter.prototype.showGame = function(self) {
  let views = {
    bottom: new View.Hand(),
    left: new View.Hand('left'),
    right: new View.Hand('right'),
    top: new View.Hand('top'),
    trick: new View.Trick(),
    dialog: new View.Dialog(),
    toast: new View.Toast()
  };

  this.shell.setTitle('Sheepshead');
  this.shell.setContents(Object.values(views));
  this.views = views;
  this.self = self;

  let stream = this.client.listenEvents();
  stream.onjoined = (player) => this.onJoined(player);
  stream.onturn = (turn) => this.onTurn(turn);
  stream.oncontested = (player) => this.onContested(player);
  stream.onplayed = (play) => this.onPlayed(play);
  stream.oncompleted = (result) => this.onCompleted(result);
  stream.onfinished = (result) => this.onFinished(result);

  views.bottom.onCardClicked = (card) => this.client.playCard(card);
};

Presenter.prototype.showHands = async function() {
  let players = await this.client.fetchPlayers();

  for (let player of players) {
    let position = this.positionOf(player);
    let cards = player.cards;

    if (this.isSelf(player)) {
      cards = await this.client.fetchCards();
    }

    this.views[position].setActive(player.actor);
    this.views[position].setPlayer(player);
    this.views[position].setCards(cards);
  }
};

Presenter.prototype.showToast = function(text, duration) {
  this.views.toast.makeText(text, duration);
}

Presenter.prototype.showAttendance = function() {
  let dialog = this.views.dialog;

  dialog.setTitle('Participate in auction?');
  dialog.show();

  let options = dialog.withOptions();
  options.addItem('Yes', true);
  options.addItem('No', false);

  options.onItemSelected = async (attend) => {
    try {
      await this.client.attendAuction(attend);
    } catch { }
  };
};

Presenter.prototype.showBidding = async function() {
  let dialog = this.views.dialog;

  dialog.setTitle('Choose what to play');
  dialog.show();

  let options = dialog.withOptions();
  let contracts = await this.client.fetchContracts();
  for (let contract of contracts) {
    let { name, suit } = contract;
    let label = name + (suit ? ` (${suit})` : '');
    options.addItem(label, contract);
  }

  options.onItemSelected = async (contract) => {
    try {
      await this.client.bidContract(contract);
    } catch { }
  };
};

Presenter.prototype.onJoined = function(player) {
  this.showToast(`${player.name} joined the game`);
};

Presenter.prototype.onTurn = function({ player, phase }) {
  let dialog = this.views.dialog;
  dialog.dismiss();

  this.showToast(`It's ${player.name}'s turn`, 1000);
  this.showHands();

  if (!this.isSelf(player)) {
    return;
  }

  switch (phase) {
  case 'attendance':
    this.showAttendance();
    break;
  case 'auction':
    this.showBidding();
    break;
  }
};

Presenter.prototype.onContested = function(player) {
  if (!this.isSelf(player)) {
    this.showToast(`${player.name} wants to play`);
  }
};

Presenter.prototype.onPlayed = function({ player, card }) {
  this.views.trick.addCard(card);
  this.showHands();
};

Presenter.prototype.onCompleted = function({ winner, points }) {
  this.showToast(`${winner.name} wins +${points}`);
};

Presenter.prototype.onFinished = function({ winner }) {
  let { players, points } = winner;
  players = players.map(p => p.name).join(' and ');
  this.showToast(`${players} won with ${points} points`, 5000);
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

