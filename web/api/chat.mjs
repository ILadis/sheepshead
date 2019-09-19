
export function Chat(publish) {
  this.publish = publish;
  this.commands = new Array();
}

Chat.prototype.register = function(command) {
  this.commands.push(command);
};

Chat.prototype.send = async function(message, player) {
  var message = Emojifier.apply(message);

  let iterator = this.commands.values();
  for (var command of iterator) {
    let args = command.matches(message);

    if (args !== false) {
      var response = await command.execute(player, args);
      break;
    }

    command = null;
  }

  if (!command) {
    return this.publish(message, player);
  }

  if (response) {
    return this.publish(response);
  }
};

export function Emoji(pattern, code) {
  this.pattern = new RegExp(pattern, 'gi');
  this.code = String.fromCodePoint(code);
}

Emoji.prototype.apply = function(message) {
  return message.replace(this.pattern, this.code);
};

export const Emojifier = new Array(
  new Emoji(':-?(?:\\)|D)', 0x1F603),
  new Emoji(':-?(?:\\)|P)', 0x1F61D),
  new Emoji('x-?(?:\\)|D)', 0x1F606),
  new Emoji('(?:q|t)\\.(?:q|t)', 0x1F62D),
  new Emoji('D-?:', 0x1F629),
  new Emoji(':-?O', 0x1F632),
  new Emoji('<3', 0x2764),
  new Emoji('z{3,}', 0x1F634));

Emojifier.apply = function(message) {
  let iterator = this.values();
  for (let emoji of iterator) {
    var message = emoji.apply(message);
  }

  return message;
};

export function Command(pattern, action) {
  this.pattern = new RegExp(`^\\s*/${pattern}\\s*$`, 'i');
  this.action = action;
}

Command.prototype.matches = function(message) {
  let matches = this.pattern.exec(message);
  if (matches) {
    return matches.groups;
  }

  return false;
};

Command.prototype.execute = function(player, args) {
  return this.action(player, args);
};

Command.Hello = function(game) {
  return new Command('hello\\s*(?<index>[1-4])?', (player, { index }) => {
    var index = index || player.index;
    var player = game.players[index - 1];
    if (player) {
      return `Hello ${player.name}!`;
    }
  });
};

Command.AddBot = function(game, input) {
  return new Command('addbot', async () => {
    let [index, rules] = input.args;

    let { Bot } = await import('../../bot/bot.mjs');
    let { Brainless } = await import('../../bot/brainless.mjs');

    let brain = new Brainless();
    let bot = new Bot(index, brain);

    if (game.phase.name != 'joining' || !rules.valid(bot)) {
      return false;
    }

    bot.attach(game);
    input.resolve(bot);
  });
};

