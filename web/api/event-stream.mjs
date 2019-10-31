
import * as Entities from './entities.mjs';

export function EventStream() {
  this.size = 0;
  this.events = new Set();
  this.subscriber = new Set();
}

EventStream.prototype.attach = function(game) {
  game.onjoined = (...args) => {
    let player = new Entities.Player(args[0]);
    this.publish('joined', player, true);
  };
  game.ondealt = (...args) => {
    this.publish('dealt', null, true);
  };
  game.onturn = (...args) => {
    let turn = new Entities.Turn(args[0], args[1]);
    this.publish('turn', turn, true);
  };
  game.oncontested = (...args) => {
    let player = new Entities.Player(args[0]);
    this.publish('contested', player, true);
  };
  game.onbidded = (...args) => {
    let contract = new Entities.Contract(args[0]);
    this.publish('bidded', contract, true);
  };
  game.onsettled = (...args) => {
    let contract = new Entities.Contract(args[0]);
    this.publish('settled', contract, true);
  };
  game.onplayed = (...args) => {
    let play = new Entities.Play(args[0], args[1]);
    this.publish('played', play, true);
  };
  game.onmatched = (...args) => {
    let match = new Entities.Match(args[0]);
    this.publish('matched', match, true);
  };
  game.oncompleted = (...args) => {
    let completion = new Entities.Completion(args[0], args[1]);
    this.publish('completed', completion, true);
  };
  game.onfinished = (...args) => {
    let winner = new Entities.Result(args[0]);
    let loser = new Entities.Result(args[1]);
    this.publish('finished', { winner, loser }, true);
    this.clear();
  };
};

EventStream.prototype.publish = function(type, entity, persistent) {
  let id = ++this.size;
  let data = JSON.stringify(entity || { });

  let event = `id: ${id}\nevent: ${type}\ndata: ${data}\n\n`;

  if (persistent) {
    this.events.add(event);
  }

  let subscriber = this.subscriber;
  for (let callback of subscriber) {
    callback(event);
  }
};

EventStream.prototype.subscribe = function(callback) {
  this.subscriber.add(callback);

  for (let event of this.events) {
    callback(event);
  }
};

EventStream.prototype.unsubscribe = function(callback) {
  this.subscriber.delete(callback);
};

EventStream.prototype.clear = function() {
  this.events.clear();
};

