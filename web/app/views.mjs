
function View(template) {
  let node = document.importNode(template.content, true);
  this.view = node.firstElementChild;
}

View.create = function(template) {
  let view = function() {
    View.call(this, template);
  };
  view.template = template;
  view.prototype = Object.create(View.prototype);
  return view;
};

View.prototype.appendTo = function(other) {
  other.appendChild(this.view);
};

function html(strings) {
  let template = document.createElement('template');
  template.innerHTML = strings.join('');
  return template;
}

export const Players = View.create(html`
<ul>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
</ul>`);

Players.prototype.setPlayer = function(player) {
  let nodes = this.view.children;
  let li = nodes[player.index - 1];
  if (li !== undefined) {
    li.textContent = `${player.name}`;
  }
};

Players.prototype.setActive = function(index) {
  let nodes = this.view.children; index--;
  for (let i = 0; i < nodes.length; i++) {
    let li = nodes[i];
    li.classList.remove('active');

    if (i == index) {
      li.classList.add('active');
    }
  }
};

export const Hand = View.create(html`
<div class="hand"></div>`);

Hand.prototype.setCards = function(cards) {
  let div = this.view;
  while (div.firstChild) {
    div.removeChild(div.firstChild);
  }

  for (let card of cards) {
    let button = document.createElement('button');
    button.className = 'card';
    button.dataset.suit = card.suit;
    button.dataset.rank = card.rank;
    button.onclick = () => this.onclick(card);

    div.appendChild(button);
  }
};

Hand.prototype.onclick = function() {
};

export const Trick = View.create(html`
<div class="trick"></div>`);

Trick.prototype.addCard = function(card) {
  let div = this.view;

  if (div.childElementCount >= 4) {
    while (div.firstChild) {
      div.removeChild(div.firstChild);
    }
  }

  let hr = document.createElement('hr');
  hr.className = 'card';
  hr.dataset.suit = card.suit;
  hr.dataset.rank = card.rank;

  div.appendChild(hr);
};

export const Toast = View.create(html`
<div class="toast">
  <span></span>
</div>`);

Toast.prototype.showText = function(text, duration = 5000) {
  let span = this.view.children[0];
  span.textContent = text;

  let div = this.view;
  div.style.opacity = 1;

  let dismiss = this.dismiss.bind(this);
  this.timeout = setTimeout(dismiss, duration);
};

Toast.prototype.dismiss = function() {
  clearTimeout(this.timeout);
  this.timeout = null;

  let div = this.view;
  div.style.opacity = 0;
};

