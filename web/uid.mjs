
import Crypto from 'crypto';

export function UID() {
  this.bytes = Crypto.randomBytes(2);
}

UID.toString = function() {
  return '([a-z0-9]+)';
};

UID.generate = function() {
  let uid = new UID();
  return uid.toString();
};

UID.prototype.toString = function() {
  return this.bytes.toString('hex').toLowerCase();
};

