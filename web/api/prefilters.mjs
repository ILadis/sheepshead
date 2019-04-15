
export function chain(...filters) {
  let callback, chain = function(request, response) {
    let iterator = filters.values();

    let next = () => {
      let { done, value } = iterator.next();
      if (!done) {
        value(request, response, next);
      } else if (callback) {
        callback(request, response);
      }
    };

    next();
  };

  chain.then = (cb) => {
    callback = cb;
    return chain;
  };

  return chain;
};

export function requiresGame(...phases) {
  return (request, response, next) => {
    let id = Number(request.pathparams['id']);
    let game = request.registry.lookup(id);
    if (!game) {
      response.writeHead(404);
      return response.end();
    }

    if (phases.length && !phases.includes(game.phase)) {
      response.writeHead(400);
      return response.end();
    }

    request.game = game;

    next();
  };
};

export function requiresPlayer() {
  return (request, response, next) => {
    let token = request.bearer;
    if (!token) {
      response.setHeader('WWW-Authenticate', 'Bearer');
      response.writeHead(401);
      return response.end();
    }

    let game = request.game;
    let player = request.registry.lookup(token);
    if (!player || !game.players.includes(player)) {
      response.writeHead(403);
      return response.end();
    }

    request.player = player;

    next();
  };
};

export function requiresActor() {
  return (request, response, next) => {
    let game = request.game;
    let player = request.player;

    if (game.actor != player) {
      response.writeHead(400);
      return response.end();
    }

    next();
  };
};

export function requiresEntity(parser) {
  return async (request, response, next) => {
    let body = await request.body;
    if (body.length <= 0) {
      response.writeHead(400);
      return response.end();
    }

    try {
      var entity = parser.parse(body);
      if (!entity) {
        response.writeHead(422);
        return response.end();
      }
    } catch {
      response.writeHead(400);
      return response.end();
    }

    request.entity = entity;

    next();
  };
};

