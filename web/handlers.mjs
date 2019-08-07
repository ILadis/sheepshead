
export function Payload(limit = 4096) {
  this.limit = limit;
}

Payload.prototype.consume = function(request) {
  let chunks = new Array();

  let promise = new Promise((resolve, reject) => {
    request.on('data', this.buffer(chunks, reject));
    request.on('end', this.concat(chunks, resolve));
  });

  return promise;
};

Payload.prototype.buffer = function(chunks, reject) {
  let length = 0;

  return (chunk) => {
    length += chunk.length;
    if (length > this.limit) {
      chunks.length = 0;
      return reject();
    }

    chunks.size = length;
    chunks.push(chunk);
  };
};

Payload.prototype.concat = function(chunks, resolve) {
  return () => {
    let body = Buffer.concat(chunks, chunks.size);
    return resolve(body);
  };
};

Payload.prototype.handle = function(request, response, next) {
  let body = this.consume(request);
  request.body = body;
  next();
};

export function Authentication() {
  this.pattern = new RegExp('^Bearer ([a-z0-9\\+/=]+)$', 'i');
};

Authentication.prototype.authenticate = function(request) {
  let header = request.headers['authorization'];
  let matches = this.pattern.exec(header);

  if (matches) {
    let token = matches[1];
    return token;
  }
};

Authentication.prototype.handle = function(request, response, next) {
  let bearer = this.authenticate(request);
  request.bearer = bearer;
  next();
};

export function Registry() {
  this.ids = 0;
  this.registry = new Map();
}

Registry.prototype.register = function(value, key) {
  key = key || ++this.ids;
  this.registry.set(key, value);
  return key;
};

Registry.prototype.unregister = function(key) {
  this.registry.delete(key);
};

Registry.prototype.lookup = function(key) {
  return this.registry.get(key);
};

Registry.prototype.entries = function*(filter = () => true) {
  let values = this.registry.values();
  for (let value of values) {
    if (filter(value)) {
      yield value;
    }
  }
};

Registry.prototype.handle = function(request, response, next) {
  request.registry = this;
  next();
};

export function Fallback() {
}

Fallback.prototype.handle = function(request, response, next) {
  response.writeHead(404);
  response.end();
};

