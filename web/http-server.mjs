
import Http from 'http';

export function HttpServer() {
  this.server = new Http.Server();
  this.handlers = new Array();
}

HttpServer.prototype.register = function(handler) {
  this.handlers.push(handler);
};

HttpServer.prototype.registerAll = function(module) {
  for (let name in module) {
    let handler = module[name];
    this.register(handler);
  }
};

HttpServer.prototype.listen = function(port) {
  let server = this.server;
  let promise = new Promise((resolve, reject) => {
    server.on('listening', resolve);
    server.on('error', reject);
  });

  server.listen(port);
  server.on('request', this.handle.bind(this));

  return promise;
};

HttpServer.prototype.handle = function(request, response) {
  let iterator = this.handlers.values();
  let next = () => {
    let { done, value } = iterator.next();
    if (!done) {
      value.handle(request, response, next);
    }
  };

  next();
};

