
export const locale = 'en';

export const strings = {
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
};

