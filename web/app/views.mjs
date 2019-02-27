
function View(template) {
  let node = document.importNode(template.content, true);
  this.view = node.firstElementChild;
}

View.create = function(template) {
  let view = function(...args) {
    View.call(this, template);
    this.postConstruct(...args);
  };
  view.template = template;
  view.prototype = Object.create(View.prototype);
  return view;
};

View.tillEvent = function(element, type) {
  return new Promise(resolve => {
    element.addEventListener(type, resolve, { once: true });
  });
};

View.prototype.postConstruct = function() {
};

View.prototype.appendTo = function(other) {
  other.appendChild(this.view);
};

function html(strings) {
  let template = document.createElement('template');
  template.innerHTML = strings.join('');
  return template;
}

export const Hand = View.create(html`
<div class="hand">
  <span></span>
</div>`);

Hand.prototype.postConstruct = function(position = 'bottom') {
  let div = this.view;
  div.classList.add(position);
};

Hand.prototype.setPlayer = function(player) {
  let span = this.view.querySelector('span');
  span.textContent = player.name;
};

Hand.prototype.setActive = function(active) {
  let span = this.view.querySelector('span');
  span.classList.remove('active');

  if (active) {
    span.classList.add('active');
  }
};

Hand.prototype.clearCards = function() {
  let buttons = this.view.querySelectorAll('button');
  for (let i = 0; i < buttons.length; i++) {
    this.view.removeChild(buttons[i]);
  }
};

Hand.prototype.setCards = function(cards) {
  this.clearCards();

  if (!Array.isArray(cards)) {
    cards = new Array(cards);
  }

  for (let card of cards) {
    let button = document.createElement('button');
    button.className = 'card';
    button.onclick = this.onclick.bind(this, card);

    if (card && card.suit && card.rank) {
      button.dataset.suit = card.suit;
      button.dataset.rank = card.rank;
    }

    this.view.appendChild(button);
  }
};

Hand.prototype.onclick = function() {
};

export const Trick = View.create(html`
<div class="trick"></div>`);

Trick.prototype.clearCards = function(atCount = 4) {
  let hrs = this.view.querySelectorAll('hr');
  if (hrs.length != atCount) {
    return;
  }

  for (let i = 0; i < hrs.length; i++) {
    this.view.removeChild(hrs[i]);
  }
};

Trick.prototype.addCard = function(card) {
  this.clearCards();

  let hr = document.createElement('hr');
  hr.className = 'card';
  hr.dataset.suit = card.suit;
  hr.dataset.rank = card.rank;

  this.view.appendChild(hr);
};

export const Toast = View.create(html`
<div class="toast">
  <span></span>
</div>`);

Toast.prototype.postConstruct = function() {
  this.queue = new Array();
};

Toast.prototype.makeText = function(text, duration = 2000) {
  this.queue.push({ text, duration });
  if (this.queue.length > 1) {
    return;
  }

  this.show();
};

Toast.prototype.show = async function() {
  let next = this.queue[0];
  if (!next) {
    return;
  }

  let span = this.view.querySelector('span');
  span.textContent = next.text;

  let div = this.view;
  div.style.opacity = 1;

  // TODO not working with chrome
  div.ontransitionend = () => {
    let dismiss = this.dismiss.bind(this);
    this.timeout = setTimeout(dismiss, next.duration);
  };
};

Toast.prototype.dismiss = function() {
  clearTimeout(this.timeout);
  this.timeout = null;

  let div = this.view;
  div.style.opacity = 0;

  div.ontransitionend = () => {
    this.queue.shift();
    this.show();
  };
};

