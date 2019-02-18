
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

export const PlayerList = View.create(html`
<ul is="player-list"></ul>`);

PlayerList.prototype.add = function(player) {
  let li = document.createElement('li');
  li.textContent = player.toString();

  this.view.appendChild(li);
};

