
import Http from 'http';
import { Handlers } from './handlers.mjs';

export function HttpServer() {
  this.server = new Http.Server();
  this.handlers = new Array();
}

HttpServer.prototype.register = function(handler) {
  this.handlers.push(handler);
};

HttpServer.prototype.registerAll = function(module) {
  let handlers = Object.values(module);
  for (let H of handlers) {
    this.register(new H());
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
  let handlers = this.handlers;
  Handlers.chain(...handlers).call(this, request, response);
};

