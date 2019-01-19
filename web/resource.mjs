
import File from 'fs';
import URL from 'url';

export function Resource(methods, path) {
  this.methods = new Set(methods);
  this.path = new RegExp(path, 'i');
};

Resource.prototype.handle = function(request, response, next) {
  let url = URL.parse(request.url);
  let matches = this.path.exec(url.pathname);

  if (!matches) {
    return next();
  }

  if (!this.methods.has(request.method)) {
    response.writeHead(405);
    return response.end();
  }

  if (typeof this[request.method] !== 'function') {
    response.writeHead(501);
    return response.end();
  }

  this[request.method](request, response, matches);
};

// TODO implement Etag based caching
Resource.serveFile = function(file, mime) {
  return (request, response) => {
    response.setHeader('Content-Type', mime);
    response.writeHead(200);

    let stream = File.createReadStream(file);
    stream.on('data', (chunk) => response.write(chunk));
    stream.on('end', () => response.end());
  };
};

Resource.serveRedirect = function(uri) {
  return (request, response) => {
    response.setHeader('Location', uri);
    response.writeHead(301);
    response.end();
  };
};

Resource.serveNotFound = function() {
  return (request, response) => {
    response.writeHead(404);
    response.end();
  };
};

