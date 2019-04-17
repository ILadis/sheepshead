# Sheepshead
Sheepshead is a work-in-progress implementation of the german trick-taking game [Schafkopf](https://en.wikipedia.org/wiki/Schafkopf), that runs inside your browser and supports multiple real-time game sessions with four human players.

![Sheepshead](https://user-images.githubusercontent.com/7196536/56324510-52cde480-616f-11e9-8439-a82492d13731.png)

## Getting started
To get the game running, you need a recent version of [Node.js](https://nodejs.org).

You can download the latest development version [here](https://github.com/ILadis/sheepshead/archive/master.zip). Unzip it to a location of your choice and run:
```sh
node --experimental-modules sheepshead-master/web/index.mjs
```

Once the server is up an running open your browser and visit: `http://localhost:8090/`

## Configuration
The server uses environment variables for its configuration. All settings are optional and default to the documented values.

#### Port
The server can be launched on an arbitrary port. This setting is optional an defaults to `8090`.

Example:
```sh
env PORT='8080' node --experimental-modules sheepshead-master/web/index.mjs
```

#### Base URI
The server can be launched with a base URI. This may be useful when running behind a reverse proxy. This setting is optional, no base URI is used when ommitted.

Example:
```sh
env BASE='/sheep' node --experimental-modules sheepshead-master/web/index.mjs
```

