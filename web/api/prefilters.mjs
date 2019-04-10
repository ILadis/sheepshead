
export const PreFilters = Object.create(null);

PreFilters.requiresGame = function(...phases) {
  let handle = (request, response, next) => {
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

  return { handle };
};

PreFilters.requiresPlayer = function() {
  let handle = (request, response, next) => {
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

  return { handle };
};

PreFilters.requiresActor = function() {
  let handle = async (request, response, next) => {
    let game = request.game;
    let player = request.player;

    if (game.actor != player) {
      response.writeHead(400);
      return response.end();
    }

    next();
  };

  return { handle };
};

PreFilters.requiresEntity = function(parser) {
  let handle = async (request, response, next) => {
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

  return { handle };
};

