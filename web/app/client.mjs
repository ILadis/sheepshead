
import { Player } from './player.mjs';
import { Card } from './card.mjs';

// TODO implement fetching cards of current trick

export function Client(id, token) {
  this.id = id;
  this.token = token;
}

Client.forGame = async function(id) {
  if (Number.isInteger(id)) {
    var request = new Request(`/games/${id}`, {
      method: 'GET'
    });
  } else {
    var request = new Request('/games', {
      method: 'POST'
    });
  }

  let response = await fetch(request);
  if (!response.ok) {
    throw response;
  }

  let json = await response.json();
  id = json.id;

  return new Client(id);
};

Client.prototype.join = async function(player) {
  let id = this.id;
  var json = JSON.stringify({
    'name': player.name
  });
  let request = new Request(`/games/${id}/players`, {
    method: 'POST',
    body: `${json}`,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  let response = await fetch(request);
  if (!response.ok) {
    throw response;
  }

  var json = await response.json();
  player.index = json.index;
  this.token = json.token;

  return player;
};

Client.prototype.players = async function(index) {
  let id = this.id;
  let query = index ? `?index=${index}` : '';
  let request = new Request(`/games/${id}/players${query}`, {
    method: 'GET'
  });

  let response = await fetch(request);
  if (!response.ok) {
    throw response;
  }

  let json = await response.json();
  let players = json.map(Player.fromProps);

  return players;
};

Client.prototype.cards = async function() {
  let id = this.id;
  let token = this.token;
  let request = new Request(`/games/${id}/cards`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  let response = await fetch(request);
  if (!response.ok) {
    throw response;
  }

  let json = await response.json();
  let cards = json.map(Card.fromProps);

  return cards;
};

Client.prototype.play = async function(card) {
  let id = this.id;
  let token = this.token;
  let json = JSON.stringify({
    'suit': card.suit.description.toLowerCase(),
    'rank': suit.rank.description.toLowerCase()
  });
  let request = new Request(`/games/${id}/trick`, {
    method: 'POST',
    body: `${json}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  let response = await fetch(request);
  if (!response.ok) {
    throw response;
  }

  return true;
};

Client.prototype.listen = function() {
  let id = this.id;
  let source = new EventSource(`/games/${id}/events?offset=1`);

  let stream = Object.create(null);
  stream.close = source.close.bind(source);
  stream.onjoined =
  stream.onturn =
  stream.onplayed = (...args) => {};

  source.addEventListener('joined', (event) => {
    let json = JSON.parse(event.data);
    let player = Player.fromProps(json);
    stream.onjoined(player);
  });
  source.addEventListener('turn', (event) => {
    let json = JSON.parse(event.data);
    let player = Player.fromProps(json.player);
    let phase = json.phase;
    stream.onturn(player, phase);
  });
  source.addEventListener('played', (event) => {
    let json = JSON.parse(event.data);
    let player = Player.fromProps(json.player);
    let card = Card.fromProps(json.card);
    stream.onplayed(player, card);
  });

  return stream;
};

