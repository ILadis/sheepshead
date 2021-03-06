
import Path from 'path';
import URL from 'url';
import { Resource } from '../resource.mjs';
import { MediaType } from '../media-type.mjs';

const Resources = Object.create(null);

for (let path of [
  filepath`./index.html`,
  filepath`./styles.css`,
  filepath`./acorn.svg`,
  filepath`./bell.svg`,
  filepath`./heart.svg`,
  filepath`./leaf.svg`,
  filepath`./back.svg`,
  filepath`./create.svg`,
  filepath`./refresh.svg`,
  filepath`./github.svg`,
  filepath`./emoji.svg`,
  filepath`./send.svg`,
  filepath`./app.mjs`,
  filepath`./presenter.mjs`,
  filepath`./strings.mjs`,
  filepath`./l18n.mjs`,
  filepath`./views.mjs`,
  filepath`./client.mjs`,
  filepath`../../polyfill.mjs`,
]) {
  let name = Path.basename(path);
  let mime = MediaType.fromFileExt(path);

  let resource = new Resource(['GET'], `/${name}`);
  resource['GET'] = Resource.serveFile(path, mime);

  Resources[name] = resource;
}

function filepath(strings) {
  let module = URL.fileURLToPath(import.meta.url);
  let dir = Path.dirname(module);

  let path = Path.join(dir, strings.join(''));

  return path;
}

export default Resources;

