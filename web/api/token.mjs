
import Crypto from 'crypto';

export function Token() {
  this.bytes = Crypto.randomBytes(2);
}

Token.generate = function() {
  let token = new Token();
  return token.toString();
};

Token.prototype.toString = function() {
  return this.bytes.toString('base64');
};

