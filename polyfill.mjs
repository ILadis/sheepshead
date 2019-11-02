
function when(type, define) {
  if (type !== 'undefined') {
    define((target, name, descriptor) => {
      if (target && name in target == false) {
        Object.defineProperty(target, name, descriptor);
      }
    });
  }
};

when(typeof Symbol, (define) => {
  define(Symbol.prototype, 'description', {
    configurable: true,
    enumerable: false,
    get: function() {
      return this.toString().slice(7, -1);
    }
  });
});

when(typeof HTMLElement, (define) => {
  let events = ['transitionend', 'animationend'];

  for (let event of events) {
    let handler = Symbol(event);

    define(HTMLElement.prototype, 'on' + event, {
      configurable: true,
      enumerable: false,
      set: function(listener) {
        this.removeEventListener(event, this[handler]);
        this[handler] = listener;
        this.addEventListener(event, this[handler]);
      },
      get: function() {
        return this[handler] || null;
      }
    });
  }
});

