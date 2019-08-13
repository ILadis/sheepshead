
export function Client() {
}

Client.prototype.createGame = async function() {
  let request = new Request('api/games', {
    method: 'POST'
  });

  let response = await fetch(request);
  if (!response.ok) {
    throw response;
  }

  let json = await response.json();

  return json;
};

Client.prototype.listGames = async function() {
  let request = new Request('api/games', {
    method: 'GET'
  });

  let response = await fetch(request);
  if (!response.ok) {
    throw response;
  }

  let json = await response.json();

  return json;
};

Client.prototype.joinGame = async function(game, name) {
  let id = game.id;
  var json = JSON.stringify({ name });

  let request = new Request(`api/games/${id}/players`, {
    method: 'POST',
    body: json,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  let response = await fetch(request);
  if (!response.ok) {
    throw response;
  }

  var json = await response.json();
  this.id = id;
  this.token = json.token;

  return json;
};

Client.prototype.leaveGame = async function() {
  let id = this.id;
  let token = this.token;
  let request = new Request(`api/games/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  let response = await fetch(request);
  if (response.ok || response.status == 404) {
    return true;
  }

  throw response;
};

Client.prototype.fetchContracts = async function() {
  let id = this.id;
  let token = this.token;
  let request = new Request(`api/games/${id}/contracts`, {
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

Client.prototype.fetchPlayers = async function(index) {
  let id = this.id;
  let query = index ? `?index=${index}` : '';
  let request = new Request(`api/games/${id}/players${query}`, {
    method: 'GET'
  });

  let response = await fetch(request);
  if (!response.ok) {
    throw response;
  }

  let json = await response.json();

  return json;
};

Client.prototype.fetchScores = async function() {
  let id = this.id;
  let request = new Request(`api/games/${id}/scores`, {
    method: 'GET'
  });

  let response = await fetch(request);
  if (!response.ok) {
    throw response;
  }

  let json = await response.json();

  return json;
};

Client.prototype.fetchCards = async function() {
  let id = this.id;
  let token = this.token;
  let request = new Request(`api/games/${id}/cards`, {
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

Client.prototype.bidContract = async function(contract) {
  let id = this.id;
  let token = this.token;
  let json = contract ? JSON.stringify(contract) : 'null';

  let request = new Request(`api/games/${id}/auction`, {
    method: 'POST',
    body: json,
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

Client.prototype.playCard = async function(card) {
  let id = this.id;
  let token = this.token;
  let json = JSON.stringify(card);

  let request = new Request(`api/games/${id}/trick`, {
    method: 'POST',
    body: json,
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

Client.prototype.sendChatMessage = async function(message) {
  let id = this.id;
  let token = this.token;
  let json = JSON.stringify({ message });

  let request = new Request(`api/games/${id}/chat`, {
    method: 'POST',
    body: json,
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

Client.prototype.listenEvents = function() {
  let id = this.id;
  let query = '?offset=1';
  let source = new EventSource(`api/games/${id}/events${query}`);

  let stream = Object.create(null);
  let offset = 0;

  let handler = function(event) {
    let id = Number.parseInt(event.lastEventId);
    let data = JSON.parse(event.data);
    if (id > offset) {
      offset = id;
      stream['on' + event.type](data);
    }
  };

  for (let event of [
    'joined',
    'dealt',
    'turn',
    'contested',
    'bidded',
    'settled',
    'played',
    'matched',
    'completed',
    'finished',
    'chat'
  ]) {
    stream['on' + event] = (...args) => { };
    source.addEventListener(event, handler);
  }

  return stream;
};

