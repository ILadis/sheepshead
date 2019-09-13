
export function DeferredInput() {
  this.promise = null;
  this.timer = null;
}

DeferredInput.prototype.attach = function(game) {
  game.onjoin =
  game.onbid =
  game.onplay = (...args) => {
    return new Promise((resolve, reject) => {
      this.promise = { resolve, reject };
      this.args = args;
    });
  };

  game.onproceed = () => {
    let timeout = game.auction.settled() ? 12000 : 200;
    return new Promise((resolve, reject) => {
      this.promise = { resolve, reject };
      this.timer = setTimeout(() => resolve(true), timeout);
    });
  };
};

DeferredInput.prototype.resolve = function(...args) {
  clearTimeout(this.timer);
  this.timer = null;

  this.promise.resolve(...args);
  this.promise = null;
};

