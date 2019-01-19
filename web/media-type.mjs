
import path from 'path';

export function MediaType (type, subtype) {
  this.type = type;
  this.subtype = subtype;
}

MediaType.prototype.withCharset = function(charset) {
  let mime = new MediaType(this.type, this.subtype);
  mime.charset = charset;

  return mime;
};

MediaType.prototype.toString = function() {
  let mime = this.type + '/' + this.subtype;
  if (this.charset) {
    mime += '; charset=' + this.charset;
  }

  return mime;
};

MediaType.fromFileExt = function(file) {
  let ext = path.extname(file).substr(1);
  return MediaType[ext];
};

MediaType.text = new MediaType('text', 'plain');
MediaType.html = new MediaType('text', 'html');
MediaType.css = new MediaType('text', 'css');
MediaType.mjs = new MediaType('text', 'javascript');
MediaType.json = new MediaType('application', 'json');
MediaType.svg = new MediaType('image', 'svg+xml');
MediaType.ico = new MediaType('image', 'ico');

