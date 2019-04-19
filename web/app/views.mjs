
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
  let sections = this.view.querySelectorAll('main > section');
  for (let i = 0; i < sections.length; i++) {
    sections[i].remove();
  }

  let section = document.createElement('section');
  for (let name in views) {
    let view = views[name];
    view.appendTo(section);
  }

  let main = this.view.querySelector('main');
  main.appendChild(section);
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
  span.classList.remove('active');

  if (player.actor) {
    span.classList.add('active');
  }
};

Hand.prototype.clearCards = function() {
  let buttons = this.view.querySelectorAll('button');
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].remove();
  }
};

Hand.prototype.setCards = function(cards) {
  this.clearCards();

  if (Number.isInteger(cards)) {
    cards = new Array(cards);
  }

  for (let card of cards) {
    let button = document.createElement('button');
    button.className = 'card';
    button.onclick = () => this.onCardClicked(card);

    if (card) {
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
    hrs[i].remove();
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

  this.view.ontransitionend = () => {
    let dismiss = this.dismiss.bind(this);
    this.timeout = setTimeout(dismiss, next.duration);
  };

  this.view.dataset.text = next.text;
  this.view.style.opacity = 1;
  this.view.style.visibility = 'visible';
};

Toast.prototype.dismiss = function() {
  clearTimeout(this.timeout);

  this.view.ontransitionend = () => {
    this.view.style.visibility = 'hidden';
    this.queue.shift();
    this.show();
  };

  this.view.style.opacity = 0;
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

  let onItemSelected = (item) => { };
  let addItem = function(label, item) {
    let li = document.createElement('li');
    li.textContent = label;
    li.onclick = () => this.onItemSelected(item);

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

export const List = View.create(html`
<div class="list">
  <ul></ul>
</div>`);

List.prototype.clearItems = function() {
  let lis = this.view.querySelectorAll('li');
  for (let i = 0; i < lis.length; i++) {
    lis[i].remove();
  }

  let ul = this.view.querySelector('ul');
  ul.style.visibility = 'hidden';
};

List.prototype.addItem = function(label, item) {
  let li = document.createElement('li');
  li.textContent = label;
  li.onclick = () => this.onItemClicked(item);

  let ul = this.view.querySelector('ul');
  ul.style.visibility = 'visible';
  ul.appendChild(li);
};

List.prototype.onItemClicked = function(item) {
};

export const FAButton = View.create(html`
<div class="fab">
  <button></button>
</div>`);

FAButton.prototype.postConstruct = function(label) {
  let button = this.view.querySelector('button');
  button.textContent = label;
  button.onclick = () => this.onClicked();
};

FAButton.prototype.onClicked = function() {
};

