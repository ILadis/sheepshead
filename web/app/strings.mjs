
export function Strings(locale, strings) {
  this.locale = locale;
  this.strings = strings;
}

Strings.forLanguage = function(tag) {
  for (let lang in Strings) {
    let strings = Strings[lang];

    if (strings instanceof Strings && strings.matches(tag)) {
      return strings;
    }
  }

  return Strings.english;
};

Strings.english = new Strings('en', {
  'lobby-title': () => 'Lobby',
  'game-title': () => 'Sheepshead',
  'player-name-fallback': () => 'Player',

  'no-games-hint': () => ''
    + 'There are currently no games available to join. '
    + 'Click the button below to create one.',

  'create-game-error': () => ''
    + 'Unable to create new game, please try again',

  'join-game-error': () => ''
    + 'Unable to join game, please refresh or try again',

  'joined-game-toast': (player) => ''
    + `${player} joined the game`,

  'contested-toast': (player) => ''
    + `${player} wants to play`,

  'bidded-toast': (player, contract, variant, self) => ''
    + `${player} wants to play a `
    + self.get('contract-label', contract, variant),

  'settled-toast': (player, contract, variant, self) => ''
    + `${player} is playing a `
    + self.get('contract-label', contract, variant),

  'trick-completed-toast': (player, points) => points.case({
    one: `${player} wins +1 point`,
    other: `${player} wins +${points} points`
  }),

  'finished-toast': (players, points) => ''
    + players.format('join', ' and ') + ` won with ${points} `
    + 'points',

  'contract-title': (phase) => phase.case({
    attendance: 'Choose what to play!',
    bidding: 'Do you want to overbid?'
  }),

  'contract-label': (contract, variant) => contract.case({
    normal: 'Normal',
    wenz: 'Wenz',
    geier: 'Geier',
    solo: 'Solo'
  }) + ' ' + variant.case({
    bell: '(Bell)',
    heart: '(Heart)',
    leaf: '(Leaf)',
    acorn: '(Acorn)'
  }),

  'concede-label': () => 'Concede',

  'game-label': (id, players) => ''
    + `Game #${id} (` + players.format('join', ', ') + ')'
});

Strings.german = new Strings('de', {
  'lobby-title': () => 'Spieleliste',
  'game-title': () => 'Schafkopf',
  'player-name-fallback': () => 'Spieler',

  'no-games-hint': () => ''
    + 'Im Moment sind keine Spiele zum Beitreten verfügbar. '
    + 'Erstelle ein neues Spiel!',

  'create-game-error': () => ''
    + 'Fehler beim Erstellen eines neuen Spiels, versuche es '
    + 'später erneut',

  'join-game-error': () => ''
    + 'Fehler beim Beitreten des Spiel, versuche es später erneut',

  'joined-game-toast': (player) => ''
    + `${player} ist dem Spiel beigetreten`,

  'contested-toast': (player) => ''
    + `${player} möchte spielen`,

  'bidded-toast': (player, contract, variant, self) => ''
    + `${player} möchte ` + contract.case({
      normal: 'ein',
      wenz: 'einen',
      geier: 'einen',
      solo: 'ein'
    }) + ' ' + self.get('contract-label', contract, variant)
    + ' spielen',

  'settled-toast': (player, contract, variant, self) => ''
    + `${player} spielt ` +contract.case({
      normal: 'ein',
      wenz: 'einen',
      geier: 'einen',
      solo: 'ein'
    }) + ' ' + self.get('contract-label', contract, variant),

  'trick-completed-toast': (player, points) => points.case({
    one: `${player} gewinnt +1 Punkt`,
    other: `${player} gewinnt +${points} Punkte`
  }),

  'finished-toast': (players, points) => ''
    + players.format('join', ' und ') + ` haben mit ${points} `
    + 'Punkten gewonnen',

  'contract-title': (phase) => phase.case({
    attendance: 'Was möchtest du spielen?',
    bidding: 'Möchtest du überbieten?'
  }),

  'contract-label': (contract, variant) => contract.case({
    normal: 'Rufspiel',
    wenz: 'Wenz',
    geier: 'Geier',
    solo: 'Solo'
  }) + ' ' + variant.case({
    bell: '(Schellen)',
    heart: '(Herz)',
    leaf: '(Blatt)',
    acorn: '(Eichel)'
  }),

  'concede-label': () => 'Aussteigen',

  'game-label': (id, players) => ''
    + `Spiel #${id} (` + players.format('join', ', ') + ')'
});

Strings.prototype.get = function(name, ...args) {
  let string = this.strings[name];
  let values = args.map(arg => this.wrap(arg));

  return string(...values, this);
};

Strings.prototype.matches = function(tag) {
  return this.locale == tag.substr(0, 2).toLowerCase();
};

Strings.prototype.wrap = function(arg) {
  return new Value(arg, Selectors, Formatter);
};

const Selectors = {
  plural: (value) => Number(value) == 1 ? 'one' : 'other',
  enum: (value) => String(value).toLowerCase()
};

const Formatter = {
  join: (value, word) => value.length <= 1
    ? value[0] || ''
    : value.slice(0, -1).join(', ') + word + value.slice(-1)
};

function Value(value, selectors, formatter) {
  this.value = value;
  this.selectors = selectors;
  this.formatter = formatter;
}

Value.prototype.case = function(options, fallback = '') {
  let value = this.value;
  let selectors = this.selectors;

  for (let kind in selectors) {
    let selector = selectors[kind];

    let key = selector(value);
    if (key && key in options) {
      return options[key];
    }
  }

  return fallback;
};

Value.prototype.format = function(kind, options) {
  let value = this.value;
  let formatter = this.formatter[kind];

  return formatter(value, options);
};

Value.prototype.toString =
Value.prototype[Symbol.toPrimitive] = function() {
  return String(this.value);
};

