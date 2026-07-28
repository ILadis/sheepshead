
import { Suit, Rank } from '../../card.mjs';

export function Brain() {
  this.prompt = new Array();
  this.round = 0;
}

function stringifyCard(card) {
  let suits = new Map([
    [Suit.bell, 'Schellen'],
    [Suit.heart, 'Herz'],
    [Suit.leaf, 'Blatt'],
    [Suit.acorn, 'Eichel'],
  ]);

  let ranks = new Map([
    [Rank.seven, 'Sieben'],
    [Rank.eight, 'Acht'],
    [Rank.nine, 'Neun'],
    [Rank.sergeant, 'Unter'],
    [Rank.officer, 'Ober'],
    [Rank.king, 'König'],
    [Rank.ten, 'Zehn'],
    [Rank.ace, 'Ass'],
  ]);

  return suits.get(card.suit) +'-'+ ranks.get(card.rank);
}

function addQuotations(value) {
  return '"' + value + '"';
}

Brain.prototype.onbid = function() {
  return undefined;
};

Brain.prototype.onplay = async function(game, actor, rules) {
  if (actor.brain == this) {
    let cards = Array.from(actor.cards);
    let options = Array.from(rules.options(cards));

    this.prompt.push(`Du bist an der Reihe, deine Handkarten lauten: ${cards.map(stringifyCard).map(addQuotations).join(', ')}.`);
    this.prompt.push(`Die Spielregeln erlauben die aus folgenden Karten zu wählen: ${options.map(stringifyCard).map(addQuotations).join(', ')}.`);
    this.prompt.push('Welche Karte möchtest du spielen.');
    this.prompt.push('Strebe an das Spiel zu gewinnen.');
    this.prompt.push('Antworte nur mit den Namen der Karte die du legen möchtest!');

    let content = this.prompt.join(' ');
    let prompt = {
      model: 'openai/gpt-4.1-mini',
      messages: [
        { role: 'system', content: '' },
        { role: 'user', content },
      ]
    };

    let request = new Request('https://models.github.ai/inference/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ...',
      },
      body: JSON.stringify(prompt),
    });

    let response = await fetch(request);
    if (!response.ok) {
      console.log('AI completion request failed, returned status: ' + request.status);
      return options[0];
    }

    let completion = await response.json();
    let choice = completion?.choices?.[0]?.message?.content;

    for (let option of options) {
      if (choice === stringifyCard(option)) {
        return option;
      }
    }

    console.log('AI chose invalid option, choice was: ' + choice);
    return options[0];
  }
};

Brain.prototype.ondealt = function(game, players) {
  let self = players.find(p => p.brain == this);
  let others = players.filter(p => p.brain != this);

  this.rounds = 0;
  this.prompt.length = 0;

  this.prompt.push(`Du bist Teil einer Schafkopf-Runde.`);
  this.prompt.push(`Dein Name lautet "${self.name}".`);
  this.prompt.push(`Deine Mitspieler heißen: ${others.map(p => p.name).map(addQuotations).join(', ')}.`);
};

Brain.prototype.onsettled = function(game, contract) {
  let key = contract.name +'-'+ contract.variant;
  let names = new Map([
    ['normal-bell', 'ein Rufspiel an und ruft das Schellen-Ass'],
    ['normal-leaf', 'ein Rufspiel an und ruft das Blatt-Ass'],
    ['normal-acorn', 'ein Rufspiel an und ruft das Eichel-Ass'],
    ['geier', 'einen Geier an'],
    ['wenz', 'einen Wenz an'],
    ['solo-bell', 'ein Schelle-Solo an'],
    ['solo-heart', 'ein Herz-Solo an'],
    ['solo-leaf', 'ein Blatt-Solo an'],
    ['solo-acorn', 'ein Eichel-Solo an'],
  ]);

  this.prompt.push(`Spieler "${contract.owner.name}" sagt ${names.get(key)}.`);
  this.prompt.push(`Die ${++this.round}. Runde beginnt.`);
};

Brain.prototype.onplayed = function(game, player, card, trick) {
  this.prompt.push(`Spieler "${player.name}" legt die Karte "${stringifyCard(card)}" in den Stich.`);
};

Brain.prototype.onmatched = function(game, contract) {
  this.prompt.push(`Es ist jetzt klar, dass "${contract.owner.name}" und "${contract.partner.name}" zusammen spielen.`);
};

Brain.prototype.oncompleted = function(game, trick, winner) {
  this.prompt.push(`Die ${this.round}. Runde ist vorbei und "${winner.name}" gewinnt den Stich.`);
  this.prompt.push(`Die ${++this.round}. Runde beginnt.`);
};

