
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

export const Shell = View.create(html`
<div class="shell">
  <header>
    <h1></h1>
  </header>
  <main></main>
</div>`);

Shell.prototype.setTitle = function(title) {
  let h1 = this.view.querySelector('header > h1');
  h1.textContent = title;
  document.title = title;
};

Shell.prototype.setContents = function(views) {
  let main = this.view.querySelector('main');
  while (main.firstChild) {
    main.firstChild.remove();
  }
  for (let view of views) {
    view.appendTo(main);
  }
};

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
    button.onclick = () => this.onCardClicked(card);

    if (card && card.suit && card.rank) {
      button.dataset.suit = card.suit;
      button.dataset.rank = card.rank;
    }

    this.view.appendChild(button);
  }
};

Hand.prototype.onCardClicked = function(card) {
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
<div class="toast"></div>`);

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

Toast.prototype.show = function() {
  clearTimeout(this.timeout);

  let next = this.queue[0];
  if (!next) {
    return;
  }

  this.view.dataset.text = next.text;
  this.view.style.opacity = 1;
  this.view.style.visibility = 'visible';
  this.view.ontransitionend = () => {
    let dismiss = this.dismiss.bind(this);
    this.timeout = setTimeout(dismiss, next.duration);
  };
};

Toast.prototype.dismiss = function() {
  clearTimeout(this.timeout);

  this.view.style.opacity = 0;
  this.view.ontransitionend = () => {
    this.view.style.visibility = 'hidden';
    this.queue.shift();
    this.show();
  };
};

export const Dialog = View.create(html`
<div class="dialog">
  <ul></ul>
</div>`);

Dialog.prototype.setTitle = function(title) {
  this.view.dataset.title = title;
};

Dialog.prototype.withOptions = function() {
  while (this.view.firstChild) {
    this.view.firstChild.remove();
  }

  let ul = document.createElement('ul');
  this.view.appendChild(ul);

  let onItemSelected = () => {};
  let addItem = function(label, data) {
    let li = document.createElement('li');
    li.textContent = label;
    li.onclick = () => this.onItemSelected(data);

    ul.appendChild(li);
  };

  return { addItem, onItemSelected };
};

Dialog.prototype.show = function() {
  this.view.style.opacity = 1;
};

Dialog.prototype.dismiss = function() {
  this.view.style.opacity = 0;
};

