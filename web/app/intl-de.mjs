
export const locale = 'de';

export const strings = {
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
};

