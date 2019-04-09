
export function Client(id) {
  this.id = id;
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

Client.prototype.joinGame = async function(name) {
  let id = this.id;
  var json = JSON.stringify({ name });

  let request = new Request(`/games/${id}/players`, {
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
  this.token = json.token;

  return json;
};

Client.prototype.fetchContracts = async function() {
  let id = this.id;
  let token = this.token;
  let request = new Request(`/games/${id}/contracts`, {
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

Client.prototype.fetchCards = async function() {
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

Client.prototype.fetchTrick = async function() {
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

Client.prototype.attendAuction = async function(attend) {
  let id = this.id;
  let token = this.token;
  let request = new Request(`/games/${id}/auction/attend`, {
    method: attend ? 'POST' : 'DELETE',
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

Client.prototype.bidContract = async function(contract) {
  let id = this.id;
  let token = this.token;
  var json = JSON.stringify(contract);

  let request = new Request(`/games/${id}/auction`, {
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

  let request = new Request(`/games/${id}/trick`, {
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
  let source = new EventSource(`/games/${id}/events?offset=1`);

  let stream = Object.create(null);
  stream.offset = 0;
  stream.close = source.close.bind(source);

  let handler = function(event) {
    let id = Number.parseInt(event.lastEventId);
    let data = JSON.parse(event.data);
    if (id > stream.offset) {
      stream.offset = id;
      stream['on' + event.type](data);
    }
  };

  for (let event of [
    'joined',
    'turn',
    'contested',
    'played',
    'completed',
    'finished'
  ]) {
    stream['on' + event] = (...args) => {};
    source.addEventListener(event, handler);
  }

  return stream;
};

