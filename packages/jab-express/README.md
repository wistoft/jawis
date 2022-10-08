# Utilities for express

Collection of utilities for working with express apps.

## Installation

```
npm i jab-express
```

## Usage

**Documentation**: Everything is developed in TypeScript, so type declarations
are the best place to find information about the individual functions and
classes.

Here are some highlights:

### WsPoolController

A pool for handling open web socket connections. Note that the pool only will
manage clients at the specified url. Clients that connect to another url can be
managed by another pool

```js
import express from "express";
import { WsPoolController } from "@jawis/jab-express";

// Create the pool

const wsPool = new WsPoolController(deps);

// Listener for web socket messages.

const onMessage = (msg, nws) => {
  // do something with the `msg` that comes from the web socket: `nws`

  //fx send a message to all clients

  wsPool.send("ping");
};

// Us the pool to make a upgrade handler

const onWsUpgrade = wsPool.makeUpgradeHandler(onMessage);

// Make a router and listen to web socket connections at the url: '/ws'

const router = express.Router();

router.ws("/ws", onWsUpgrade);
```

### Small utilities

- `makeApp`
- `makeRoute`

## Build

All imports are side effect free. So this library is ideal for tree-shaking.

## Related work

## License

MIT
