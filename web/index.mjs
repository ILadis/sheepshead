
import '../polyfill.mjs';
import { HttpServer } from './http-server.mjs';
import { Resource } from './resource.mjs';
import * as Handlers from './handlers.mjs';

import Api from './api/resources.mjs';
import App from './app/resources.mjs';

let port = process.env.PORT || 8090;
let base = process.env.BASE || '';

let index = new Resource(['GET'], '/');
index['GET'] = Resource.serveRedirect('/index.html');

let server = new HttpServer();
server.register(new Handlers.Payload());
server.register(new Handlers.Authentication());
server.register(new Handlers.Registry());
server.registerAll(Api);
server.registerAll(App);
server.register(index);
server.register(new Handlers.Fallback());

server.baseUri(base);
server.listen(port);

