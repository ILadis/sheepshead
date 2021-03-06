
import File from 'fs';
import URL from 'url';

export function Resource(methods, path) {
  this.methods = new Set(methods);
  this.path = new RegExp(`^${path}$`, 'i');
}

Resource.prototype.handle = function(request, response, next) {
  let url = URL.parse(request.url, true);
  let base = this.base || '';
  if (!url.pathname.startsWith(base)) {
    return next();
  }

  let path = url.pathname.substr(base.length);
  let matches = this.path.exec(path);
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
    response.writeHead(302);
    response.end();
  };
};

Resource.serveNotFound = function() {
  return async (request, response) => {
    response.writeHead(404);
    response.end();
  };
};

