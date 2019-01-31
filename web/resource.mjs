
import File from 'fs';
import URL from 'url';

export function Resource(methods, path) {
  this.methods = new Set(methods);
  this.path = new RegExp(path, 'i');
};

Resource.create = function(methods, path) {
  let resource = function() {
    Resource.call(this, methods, path);
  };
  resource.prototype = Object.create(Resource.prototype);
  return resource;
};

Resource.prototype.handle = function(request, response, next) {
  let url = URL.parse(request.url, true);
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

  request.pathparams = matches.groups;
  request.url = url;

  this[request.method](request, response);
};

// TODO implement Etag based caching
Resource.serveFile = function(file, mime) {
  return async (request, response) => {
    response.setHeader('Content-Type', mime);
    response.writeHead(200);

    let stream = File.createReadStream(file);
    stream.on('data', (chunk) => response.write(chunk));
    stream.on('end', () => response.end());
  };
};

Resource.serveRedirect = function(uri) {
  return async (request, response) => {
    response.setHeader('Location', uri);
    response.writeHead(301);
    response.end();
  };
};

Resource.serveNotFound = function() {
  return async (request, response) => {
    response.writeHead(404);
    response.end();
  };
};

