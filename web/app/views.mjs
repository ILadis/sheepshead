
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
    li.textContent = `${player.name} (${player.points}P.)`;
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

export const Cards = View.create(html`
<ul></ul>`);

Cards.prototype.show = function(cards) {
  let ul = this.view;
  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }

  for (let card of cards) {
    let button = document.createElement('button');
    button.onclick = () => this.onclick(card);
    button.textContent = card;

    let li = document.createElement('li');
    li.appendChild(button);

    ul.appendChild(li);
  }
};

Cards.prototype.onclick = function() {
};

export const Trick = View.create(html`
<ul></ul>`);

Trick.prototype.show = function(cards) {
  let ul = this.view;
  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }

  for (let card of cards) {
    let li = document.createElement('li');
    li.textContent = card;

    ul.appendChild(li);
  }
};

