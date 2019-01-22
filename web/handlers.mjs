
export function Payload() {
}

Payload.prototype.consume = function(request) {
  let chunks = new Array();
  let promise = new Promise((resolve) => {
    request.on('data', (chunk) => {
      chunks.push(chunk);
    }).on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });

  return promise;
};

Payload.prototype.handle = function(request, response, next) {
  let body = this.consume(request);
  request.body = body;
  next();
};

export function Authentication() {
  this.pattern = new RegExp('^Bearer ([a-z0-9]+)$', 'i');
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

