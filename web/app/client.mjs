
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

Client.prototype.join = async function(name) {
  let id = this.id;
  var json = JSON.stringify({
    'name': name
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
  this.token = json.token;

  return json;
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

  return json;
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

  return json;
};

Client.prototype.trick = async function() {
  let id = this.id;
  let request = new Request(`/games/${id}/trick`, {
    method: 'GET',
  });

  let response = await fetch(request);
  if (!response.ok) {
    throw response;
  }

  let json = await response.json();

  return json;
};

Client.prototype.play = async function(card) {
  let id = this.id;
  let token = this.token;
  let json = JSON.stringify({
    'suit': card.suit,
    'rank': card.rank
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
  stream.onplayed =
  stream.oncompleted =
  stream.onfinished = (...args) => {};

  source.addEventListener('joined', (event) => {
    let json = JSON.parse(event.data);
    stream.onjoined(json);
  });
  source.addEventListener('turn', (event) => {
    let json = JSON.parse(event.data);
    stream.onturn(json.player, json.phase);
  });
  source.addEventListener('played', (event) => {
    let json = JSON.parse(event.data);
    stream.onplayed(json.player, json.card);
  });
  source.addEventListener('completed', (event) => {
    let json = JSON.parse(event.data);
    stream.oncompleted(json.winner, json.points);
  });
  source.addEventListener('finished', (event) => {
    let json = JSON.parse(event.data);
    stream.onfinished(json.winner, json.loser);
  });

  return stream;
};

