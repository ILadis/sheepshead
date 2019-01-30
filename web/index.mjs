
import { HttpServer } from './http-server.mjs'
import { Resource } from './resource.mjs'

import * as Handlers from './handlers.mjs';
import * as Api from './api/resources.mjs';

let server = new HttpServer();
server.register(new Handlers.Payload());
server.register(new Handlers.Authentication());
server.register(new Handlers.Registry());
server.register(new Api.Games());
server.register(new Api.State());
server.register(new Api.Players());
server.register(new Api.Cards());
server.register(new Api.Trick());

let fallback = new Resource(['GET'], '.*');
fallback['GET'] = Resource.serveNotFound();

server.register(fallback);
server.listen(8090);

