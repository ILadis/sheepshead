
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

Shell.prototype.setRefreshable = function(enable) {
  let header = this.node.querySelector('header');

  let button = header.querySelector('button.refresh');
  if (!enable && button) {
    header.removeChild(button);
  }

  if (enable && !button) {
    button = document.createElement('button');
    button.className = 'refresh';
    button.onclick = () => this.onRefreshClicked();

    header.appendChild(button);
  }
};

Shell.prototype.clearSections = function() {
  let sections = this.node.querySelectorAll('main > section');
  for (let i = 0; i < sections.length; i++) {
    sections[i].remove();
  }
};

Shell.prototype.newSection = function(name) {
  let section = document.createElement('section');
  section.className = name;

  let main = this.node.querySelector('main');
  main.appendChild(section);

  let addView = (view) => {
    section.appendChild(view.node);
  };

  return { addView };
};

Shell.prototype.onRefreshClicked = function() {
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

Trick.prototype.clearCards = function() {
  let hrs = this.node.querySelectorAll('hr');
  if (hrs.length >= 4) {
    for (let i = 0; i < hrs.length; i++) {
      hrs[i].remove();
    }
  }
};

Trick.prototype.addCard = function(card, position) {
  this.clearCards();

  let hr = document.createElement('hr');
  hr.className = 'card';
  hr.classList.add(card.suit);
  hr.classList.add(card.rank);

  hr.classList.add(position);
  hr.style.animationName = `slidein-${position}`;

  this.node.appendChild(hr);
};

export const Chat = function() {
  this.node = importNode(Chat.template);
}

Chat.template = html`
<div class="chat">
  <ul></ul>
  <section>
    <input type="text">
    <button></button>
  </section>
</div>
`;

Chat.prototype.addMessage = function(message, player, self) {
  let span = document.createElement('span');
  span.textContent = message;

  if (player) {
    let h6 = document.createElement('h6');
    h6.textContent = player.name;
    span.appendChild(h6);
  }

  let li = document.createElement('li');
  li.appendChild(span);

  switch (self) {
  case true:
    li.className = 'self';
    break;
  case false:
    li.className = 'other';
    break;
  }

  let ul = this.node.querySelector('ul');
  ul.appendChild(li);
};

Chat.prototype.setTypingsPlaceholder = function(placeholder) {
  let input = this.node.querySelector('input');
  input.placeholder = placeholder;

  let button = this.node.querySelector('button');
  button.onclick = () => this.onMessageSubmitted(input.value);
};

Chat.prototype.clearTypings = function() {
  let input = this.node.querySelector('input');
  input.value = '';
};

Chat.prototype.onMessageSubmitted = function(message) {
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
  if (next) {
    let span = this.node.querySelector('span');
    span.textContent = next.text;

    let div = this.node;
    getComputedStyle(div).opacity;
    div.style.opacity = 1;
    div.style.visibility = 'visible';

    div.ontransitionend = () => {
      let dismiss = this.dismiss.bind(this);
      this.timeout = setTimeout(dismiss, next.duration);
    };
  }
};

Toast.prototype.dismiss = function() {
  clearTimeout(this.timeout);

  let div = this.node;
  getComputedStyle(div).opacity;
  div.style.opacity = 0;

  div.ontransitionend = () => {
    div.style.visibility = 'hidden';

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
  <section></section>
</div>`;

Dialog.prototype.setTitle = function(title) {
  let h1 = this.node.querySelector('h1')
  h1.textContent = title;
};

Dialog.prototype.withContent = function(content) {
  let container = this.node.querySelector('section');
  while (container.firstChild) {
    container.firstChild.remove();
  }

  let buttons = this.node.querySelectorAll('button');
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].remove();
  }

  container.appendChild(content);
};

Dialog.prototype.withOptions = function() {
  let ul = document.createElement('ul');
  this.withContent(ul);

  let onItemSelected = (item) => { };
  let addItem = function(label, item) {
    let li = document.createElement('li');
    li.textContent = label;
    li.onclick = () => this.onItemSelected(item);

    ul.appendChild(li);
  };

  return { addItem, onItemSelected };
};

Dialog.prototype.withTable = function() {
  let table = document.createElement('table');
  this.withContent(table);

  let hasCols = false;
  let addRow = (...contents) => {
    let tr = document.createElement('tr');
    for (let content of contents) {
      let td = document.createElement(hasCols ? 'td' : 'th');
      td.textContent = content;
      tr.appendChild(td);
    }
    hasCols = true;
    table.appendChild(tr);
  };

  return { addRow };
};

Dialog.prototype.addAction = function(label, callback) {
  let button = document.createElement('button');
  button.textContent = label;
  button.onclick = () => callback();

  this.node.appendChild(button);
};

Dialog.prototype.show = function() {
  let div = this.node;
  getComputedStyle(div).opacity;
  div.style.opacity = 1;
  div.style.visibility = 'visible';

  div.ontransitionend = () => { };
};

Dialog.prototype.dismiss = function() {
  let div = this.node;
  getComputedStyle(div).opacity;
  div.style.opacity = 0;

  div.ontransitionend = () => {
    div.style.visibility = 'hidden';
  };
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
  <input type="text" autocorrect="off" autocapitalize="words">
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

  let button = this.node.querySelector('button');
  button.onclick = () => this.onClicked();
}

Button.template = html`
<div class="fab">
  <button></button>
</div>`;

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

