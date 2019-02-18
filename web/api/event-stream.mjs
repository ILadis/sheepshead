
import * as Entities from './entities.mjs';

export function EventStream() {
  this.events = new Array();
  this.subscriber = new Set();
}

EventStream.prototype.attach = function(game) {
  game.events = this;
  game.onjoined = (...args) => {
    let player = new Entities.Player(args[0]);
    this.publish('joined', player);
  };
  game.onturn = (...args) => {
    let player = new Entities.Turn(args[0], args[1]);
    this.publish('turn', player);
  };
  game.onplayed = (...args) => {
    let play = new Entities.Play(args[0], args[1]);
    this.publish('played', play);
  };
};

EventStream.prototype.publish = function(type, entity) {
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

