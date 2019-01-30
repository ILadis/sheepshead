
export function Parser() {
  this.types = new Map();
}

Parser.compose = function() {
  return new Parser();
};

Parser.prototype.string = function(property) {
  this.types.set(property, 'string');
  return this;
};

Parser.prototype.boolean = function(property) {
  this.types.set(property, 'boolean');
  return this;
};

Parser.prototype.number = function(property) {
  this.types.set(property, 'number');
  return this;
};

Parser.prototype.map = function(mapper) {
  this.mapper = mapper;
  return this;
};

Parser.prototype.parse =
Parser.prototype.apply = function(buffer) {
  let json = JSON.parse(buffer);

  for (let [property, type] of this.types) {
    let value = json[property];

    if (typeof value !== type) {
      return;
    }
  }

  let entity = this.mapper(json);
  return entity;
};

