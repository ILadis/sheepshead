
import Path from 'path';
import URL from 'url';
import { Resource } from '../resource.mjs';
import { MediaType } from '../media-type.mjs';

const Resources = Object.create(null);

for (let path of [
  filepath`./index.html`,
  filepath`./styles.css`,
  filepath`./app.mjs`,
  filepath`./views.mjs`,
  filepath`./client.mjs`,
  filepath`./../../player.mjs`,
  filepath`./../../card.mjs`
]) {
  let name = Path.basename(path);
  let mime = MediaType.fromFileExt(path);

  let resource = Resource.create(['GET'], `^/${name}$`);
  resource.prototype['GET'] = Resource.serveFile(path, mime);

  Resources[name] = resource;
}

function filepath(strings) {
  let module = URL.fileURLToPath(import.meta.url);
  let dir = Path.dirname(module);

  let path = Path.join(dir, strings.join(''));

  return path;
}

export default Resources;

