
export const Shell = function() {
  this.node = importNode(Shell.template);
}

Shell.template = html`
<div class="shell">
  <header>
    <h1></h1>
  </header>
  <main></main>
</div>`;

Shell.prototype.setTitle = function(title) {
  let h1 = this.node.querySelector('header > h1');
  h1.textContent = title;
  document.title = title;
};

Shell.prototype.setContents = function(views) {
  let sections = this.node.querySelectorAll('main > section');
  for (let i = 0; i < sections.length; i++) {
    sections[i].remove();
  }

  let section = document.createElement('section');
  for (let name in views) {
    let view = views[name];
    section.appendChild(view.node);
  }

  let main = this.node.querySelector('main');
  main.appendChild(section);
};

export const Hand = function() {
  this.node = importNode(Hand.template);
}

Hand.template = html`
<div class="hand">
  <span></span>
</div>`;

Hand.prototype.setPosition = function(position) {
  switch (position) {
  case 'top':
  case 'bottom':
  case 'left':
  case 'right':
    this.node.classList.add(position);
  }
};

Hand.prototype.setPlayer = function(player) {
  let span = this.node.querySelector('span');
  span.textContent = player.name;
  span.classList.remove('active');
  if (player.actor) {
    span.classList.add('active');
  }
};

Hand.prototype.setActor = function(actor) {
  let span = this.node.querySelector('span');
  span.classList.remove('active');
  if (actor) {
    span.classList.add('active');
  }
}

Hand.prototype.clearCards = function() {
  let buttons = this.node.querySelectorAll('button');
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
      button.classList.add(card.suit);
      button.classList.add(card.rank);
    }

    this.node.appendChild(button);
  }
};

Hand.prototype.onCardClicked = function(card) {
};

export const Trick = function() {
  this.node = importNode(Trick.template);
}

Trick.template = html`
<div class="trick"></div>`;

Trick.prototype.clearCards = function(atCount = 4) {
  let hrs = this.node.querySelectorAll('hr');
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
  hr.classList.add(card.suit);
  hr.classList.add(card.rank);

  this.node.appendChild(hr);
};

export const Toast = function() {
  this.node = importNode(Toast.template);
  this.queue = new Array();
}

Toast.template = html`
<div class="toast">
  <span></span>
</div>`;

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

  let span = this.node.querySelector('span');
  span.style.opacity = 1;
  span.textContent = next.text;

  span.ontransitionend = () => {
    let dismiss = this.dismiss.bind(this);
    this.timeout = setTimeout(dismiss, next.duration);
  };
};

Toast.prototype.dismiss = function() {
  clearTimeout(this.timeout);

  let span = this.node.querySelector('span');
  span.style.opacity = 0;

  span.ontransitionend = () => {
    this.queue.shift();
    this.show();
  };
};

export const Dialog = function() {
  this.node = importNode(Dialog.template);
}

Dialog.template = html`
<div class="dialog">
  <h1></h1>
  <ul></ul>
</div>`;

Dialog.prototype.setTitle = function(title) {
  let h1 = this.node.querySelector('h1')
  h1.textContent = title;
};

Dialog.prototype.withOptions = function() {
  let ul = this.node.querySelector('ul');

  while (ul.firstChild) {
    ul.firstChild.remove();
  }

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
  this.node.style.opacity = 1;
};

Dialog.prototype.dismiss = function() {
  this.node.style.opacity = 0;
};

export const List = function() {
  this.node = importNode(List.template);
}

List.template = html`
<div class="list">
  <span></span>
  <ul></ul>
</div>`;

List.prototype.setHint = function(hint) {
  let span = this.node.querySelector('span');
  span.textContent = hint;
};

List.prototype.clearItems = function() {
  let lis = this.node.querySelectorAll('li');
  for (let i = 0; i < lis.length; i++) {
    lis[i].remove();
  }

  let ul = this.node.querySelector('ul');
  ul.style.visibility = 'hidden';

  let span = this.node.querySelector('span');
  span.style.display = 'block';
};

List.prototype.addItem = function(label, item) {
  let li = document.createElement('li');
  li.textContent = label;
  li.onclick = () => this.onItemClicked(item);

  let ul = this.node.querySelector('ul');
  ul.style.visibility = 'visible';
  ul.appendChild(li);

  let span = this.node.querySelector('span');
  span.style.display = 'none';
};

List.prototype.onItemClicked = function(item) {
};

export const Textfield = function() {
  this.node = importNode(Textfield.template);
}

Textfield.template = html`
<div class="textfield">
  <span></span>
  <input type="text">
</div>`;

Textfield.prototype.setLabel = function(label) {
  let span = this.node.querySelector('span');
  span.textContent = label;
};

Textfield.prototype.setValue = function(value) {
  let input = this.node.querySelector('input');
  input.value = value;
  input.onchange = () => this.onValueChange(input.value);
};

Textfield.prototype.onValueChanged = function(value) {
};

export const Button = function() {
  this.node = importNode(Button.template);
}

Button.template = html`
<div class="fab">
  <button></button>
</div>`;

Button.prototype.setLabel = function(label) {
  let button = this.node.querySelector('button');
  button.textContent = label;
  button.onclick = () => this.onClicked();
}

Button.prototype.onClicked = function() {
};

function html(source) {
  let template = document.createElement('template');
  template.innerHTML = source[0];
  return template.content;
}

function importNode(template) {
  let node = document.importNode(template, true);
  return node.firstElementChild;
}

