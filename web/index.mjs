
import { HttpServer } from './http-server.mjs'
import { Resource } from './resource.mjs'
import * as Handlers from './handlers.mjs'

import Api from './api/resources.mjs';
import App from './app/resources.mjs';

let server = new HttpServer();
server.register(new Handlers.Payload());
server.register(new Handlers.Authentication());
server.register(new Handlers.Registry());
server.registerAll(Api);
server.registerAll(App);

let index = new Resource(['GET'], '^/$');
index['GET'] = Resource.serveRedirect('/index.html');
server.register(index);

let fallback = new Resource(['GET'], '.*');
fallback['GET'] = Resource.serveNotFound();
server.register(fallback);

server.listen(8090);

