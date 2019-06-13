
export function DeferredInput() {
  this.promise = null;
}

DeferredInput.prototype.attach = function(game) {
  game.input = this;

  game.onjoin =
  game.onbid =
  game.onplay = (...args) => {
    return new Promise((resolve, reject) => {
      this.promise = { resolve, reject };
      this.args = args;
    });
  };

  game.onproceed = () => {
    return true;
  };
};

DeferredInput.prototype.resolve = function(...args) {
  this.promise.resolve(...args);
  this.promise = null;
};

