
export const de = {
  'lobby-title': () => 'Spieleliste',
  'game-title': () => 'Schafkopf',

  'player-name-input': () => 'Du spielst als',
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

  'refreshed-games-toast': () => 'Spieleliste wurde aktualisiert',

  'leave-game-action': () => 'Spiel verlassen',

  'contested-toast': (player) => ''
    + `${player} möchte spielen`,

  'bidded-toast': (player, contract, variant) => ''
    + `${player} möchte ` + contract.case({
      normal: 'ein',
      wenz: 'einen',
      geier: 'einen',
      solo: 'ein'
    }) + ` ${de['contract-label'](contract, variant)} spielen`,

  'settled-toast': (player, contract, variant) => ''
    + `${player} spielt ` + contract.case({
      normal: 'ein',
      wenz: 'einen',
      geier: 'einen',
      solo: 'ein'
    }) + ` ${de['contract-label'](contract, variant)}`,

  'matched-toast': (owner, partner) => ''
    + `${owner} spielt mit ${partner}`,

  'trick-completed-toast': (player, points) => points.case({
    one: `${player} gewinnt +1 Auge`,
    other: `${player} gewinnt +${points} Augen`
  }),

  'finished-toast': (players, points) => ''
    + players.format('join', ' und ') + ' ' + players.case({
      one: `hat`,
      other: `haben`
    }) + ` mit ${points} Augen gewonnen`,

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
    + `Spiel #${id} `
    + `${players.format('join', ', ').format('bound', '(', ')')}`,

  'standings-title': () => 'Punktestand',
  'standings-player': () => 'Spieler',
  'standings-score': () => 'Punkte',
  'standings-total': () => 'Total',

  'chat-typings-placeholder': () => 'Schreibe eine Nachricht',
  'chat-emoji-smileys-label': () => 'Smileys',
  'chat-emoji-symbols-label': () => 'Symbole'
};

export const en = {
  'lobby-title': () => 'Lobby',
  'game-title': () => 'Sheepshead',

  'player-name-input': () => "You're playing as",
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

  'refreshed-games-toast': () => 'Available games refreshed',

  'leave-game-action': () => 'Leave game',

  'contested-toast': (player) => ''
    + `${player} wants to play`,

  'bidded-toast': (player, contract, variant) => ''
    + `${player} wants to play a `
    + `${en['contract-label'](contract, variant)}`,

  'settled-toast': (player, contract, variant) => ''
    + `${player} is playing a `
    + `${en['contract-label'](contract, variant)}`,

  'matched-toast': (owner, partner) => ''
    + `${owner} is playing with ${partner}`,

  'trick-completed-toast': (player, points) => points.case({
    one: `${player} wins +1 point`,
    other: `${player} wins +${points} points`
  }),

  'finished-toast': (players, points, score) => ''
    + players.format('join', ' and ') + ` won with ${points}`,

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
    + `Game #${id} `
    + `${players.format('join', ', ').format('bound', '(', ')')}`,

  'standings-title': () => 'Current standings',
  'standings-player': () => 'Player',
  'standings-score': () => 'Score',
  'standings-total': () => 'Total',

  'chat-typings-placeholder': () => 'Type a message',
  'chat-emoji-smileys-label': () => 'Smileys',
  'chat-emoji-symbols-label': () => 'Symbols'
};

