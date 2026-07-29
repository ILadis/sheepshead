
import { CopilotCLI } from './client.mjs';

export function Brain() {
  this.ai = new CopilotCLI();
  this.prompt = new Array();
  this.round = 0;
}

Brain.prototype.onbid = function() {
  return undefined;
};

Brain.prototype.onplay = async function(game, actor, rules) {
  if (actor.brain != this) {
    return false;
  }

  let cards = Array.from(actor.cards);
  let options = Array.from(rules.options(cards));

  if (options.length <= 1) {
    return options[0];
  }

  let length = this.prompt.length;

  this.prompt.push(''
    + `Du bist an der Reihe, deine Handkarten lauten: ${t(cards)}. In der aktuellen `
    + `Spielsituation kannst du aus deinen Handkarten folgende auswählen: ${t(options)}. `
    + 'Strebe an das Spiel zusammen mit deinem Partner zu gewinnen. Versuche dich '
    + 'dabei an die allgemeinen Verhaltensregeln beim Schafkopf zu orientieren. Welche '
    + 'Karte möchtest du spielen? Antworte nur mit dem exakten Namen deiner Handkarte '
    + 'die du legen möchtest!');

  let prompt = this.prompt.join(' ');
  this.prompt.length = length;

  try {
    console.log('AI prompt:', prompt);

    let { result, reasoning } = await this.ai.prompt(prompt);

    console.log('AI reasoning:', reasoning);
    console.log('AI response:', result);

    for (let option of options) {
      if (result === t(option)) {
        return option;
      }
    }

    console.log('AI chose invalid option!');
    return options[0];
  } catch (error) {
    console.log(error);
    return options[0];
  }
};

Brain.prototype.ondealt = function(game, players) {
  let self = players.find(p => p.brain == this);
  let others = players.filter(p => p.brain != this);

  this.round = 0;
  this.prompt.length = 0;

  this.prompt.push(''
    + `Du bist Teil einer Schafkopf-Runde. Dein Name lautet ${t(self)}. `
    + `Deine anderen Spieler heißen: ${t(others)}.`);
};

Brain.prototype.onsettled = function(game, contract) {
  this.prompt.push(''
    + `Spieler ${t(contract.owner)} sagt ${t(contract)}.`);

  let self = game.players.find(p => p.brain == this);
  let declarer = self.cards.contains(contract.partner);

  if (contract.owner != self) {
    this.prompt.push(declarer
      ? `Du bist damit in der Spielerpartei und spielst mit ${t(contract.owner )} zusammen.`
      : 'Du bist damit in der Nichtspielerpartei und kennst deinen Partner noch nicht.');
  }

  this.prompt.push(`Die ${++this.round}. Runde beginnt.`);
};

Brain.prototype.onplayed = function(game, player, card, trick) {
  this.prompt.push(''
    + `Spieler ${t(player)} legt die Karte ${t(card)} in den Stich.`);
};

Brain.prototype.onmatched = function(game, contract) {
  let declarer = [contract.owner, contract.partner];
  let defender = game.players.filter(p => !declarer.includes(p));

  this.prompt.push(''
    + `Es ist jetzt für alle klar, dass ${t(contract.owner)} `
    + `und ${t(contract.partner)} die Spielerpartei bilden und `
    + `gegen ${t(defender[0])} und ${t(defender[1])} spielen.`);
};

Brain.prototype.oncompleted = function(game, trick, winner) {
  this.prompt.push(''
    + `Die ${this.round}. Runde ist vorbei und ${t(winner)} gewinnt den Stich. `
    + `Die ${++this.round}. Runde beginnt.`);
};

const t = function stringify(value) {
  if (Array.isArray(value)) {
    return value.map(stringify).join(', ');
  }

  let cards = new Map([
    ['bell', 'Schellen'],
    ['heart', 'Herz'],
    ['leaf', 'Gras'],
    ['acorn', 'Eichel'],
    ['seven', 'Sieben'],
    ['eight', 'Acht'],
    ['nine', 'Neun'],
    ['sergeant', 'Unter'],
    ['officer', 'Ober'],
    ['king', 'König'],
    ['ten', 'Zehn'],
    ['ace', 'Ass'],
  ]);

  let contracts = new Map([
    ['normal', (variant) => `ein Rufspiel an und ruft das ${cards.get(variant)}-Ass`],
    ['geier', () => 'einen Geier an'],
    ['wenz', () => 'einen Wenz an'],
    ['solo', (variant) => `ein ${cards.get(variant)}-Solo an`],
  ]);

  let type = value.constructor.name.toLowerCase();
  switch (type) {
  case 'player':
    return `"${value.name}"`;
  case 'card':
    return `${cards.get(value.suit.description)}-${cards.get(value.rank.description)}`;
  case 'contract':
    return contracts.get(value.name)(value.variant);
  }
};

