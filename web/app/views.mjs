
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

Players.prototype.show = function(player) {
  let nodes = this.view.children;
  let li = nodes[player.index - 1];
  if (li !== undefined) {
    li.textContent = `${player.name}`;
  }
};

Players.prototype.setActive = function(index) {
  let nodes = this.view.children;
  for (let i = 1; i <= nodes.length; i++) {
    let li = nodes[i - 1];
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

Trick.prototype.setCards = function(cards) {
  let div = this.view;
  while (div.firstChild) {
    div.removeChild(div.firstChild);
  }

  for (let card of cards) {
    let hr = document.createElement('hr');
    hr.className = 'card';
    hr.dataset.suit = card.suit;
    hr.dataset.rank = card.rank;

    div.appendChild(hr);
  }
};

