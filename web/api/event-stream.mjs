
import * as Entities from './entities.mjs';

export function EventStream() {
  this.events = new Array();
  this.subscriber = new Set();
}

EventStream.prototype.attach = function(game) {
  game.onjoined = (...args) => {
    let player = new Entities.Player(args[0]);
    this.publish('joined', player);
  };
  game.ondealt = (...args) => {
    this.publish('dealt');
  };
  game.onturn = (...args) => {
    let turn = new Entities.Turn(args[0], args[1]);
    this.publish('turn', turn);
  };
  game.oncontested = (...args) => {
    let player = new Entities.Player(args[0]);
    this.publish('contested', player);
  };
  game.onbidded = (...args) => {
    let contract = new Entities.Contract(args[0]);
    this.publish('bidded', contract);
  };
  game.onsettled = (...args) => {
    let contract = new Entities.Contract(args[0]);
    this.publish('settled', contract);
  };
  game.onplayed = (...args) => {
    let play = new Entities.Play(args[0], args[1]);
    this.publish('played', play);
  };
  game.onmatched = (...args) => {
    let match = new Entities.Match(args[0]);
    this.publish('matched', match);
  };
  game.oncompleted = (...args) => {
    let completion = new Entities.Completion(args[0], args[1]);
    this.publish('completed', completion);
  };
  game.onfinished = (...args) => {
    let winner = new Entities.Result(args[0]);
    let loser = new Entities.Result(args[1]);
    this.publish('finished', { winner, loser });
  };
};

EventStream.prototype.publish = function(type, entity = { }) {
  let id = this.events.length + 1;
  let data = JSON.stringify(entity);

  let event = `id: ${id}\nevent: ${type}\ndata: ${data}\n\n`;
  this.events.push(event);

  let subscriber = this.subscriber;
  for (let callback of subscriber) {
    callback(event);
  }
};

EventStream.prototype.subscribe = function(callback, offset) {
  this.subscriber.add(callback);

  let events = this.events; offset--;
  while (events[offset] !== undefined) {
    callback(events[offset++]);
  }
};

EventStream.prototype.unsubscribe = function(callback) {
  this.subscriber.delete(callback);
};

