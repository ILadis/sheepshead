
export function Strings(locale, strings) {
  this.locale = locale;
  this.strings = strings;
}

Strings.forLanguage = async function(lang) {
  let tag = lang.substr(0, 2);

  try {
    var intl = await import(`./intl-${tag}.mjs`);
  } catch (e) {
    var intl = await import('./intl-en.mjs');
  }

  let { locale, strings } = intl;
  return new Strings(locale, strings);
};

Strings.prototype.get = function(name, ...args) {
  let string = this.strings[name];
  let values = args.map(arg => this.wrap(arg));

  return string(...values, this);
};

Strings.prototype.wrap = function(arg) {
  return new Value(arg, Selectors, Formatter);
};

const Selectors = {
  plural: (value) => Number(value) == 1 ? 'one' : 'other',
  enum: (value) => String(value).toLowerCase()
};

const Formatter = {
  join: (value, word) => value.length <= 1
    ? value[0] || ''
    : value.slice(0, -1).join(', ') + word + value.slice(-1)
};

function Value(value, selectors, formatter) {
  this.value = value;
  this.selectors = selectors;
  this.formatter = formatter;
}

Value.prototype.case = function(options, fallback = '') {
  let value = this.value;
  let selectors = this.selectors;

  for (let kind in selectors) {
    let selector = selectors[kind];

    let key = selector(value);
    if (key && key in options) {
      return options[key];
    }
  }

  return fallback;
};

Value.prototype.format = function(kind, options) {
  let value = this.value;
  let formatter = this.formatter[kind];

  return formatter(value, options);
};

Value.prototype.toString =
Value.prototype[Symbol.toPrimitive] = function() {
  return String(this.value);
};

