# Compile service for Node.js worker threads

Delivers transpiled TypeScript to a Node.js worker thread.

## Installation

```
npm i @jawis/jacs
```

## Usage

```js
import { mainProvToConsole } from "@jawis/jab-node";
import { makeMakeJacsWorkerBee } from "@jawis/jacs";

const mainProv = mainProvToConsole();

const makeBee = makeMakeJacsWorkerBee(mainProv);

const bee = makeBee({
  filename: "/path/to/my-script.ts",
  onMessage: console.log,
  onStdout: console.log,
  onStderr: console.log,
  onError: console.log,
  onExit: (status) => {
    //needed because jacs blocks exit, by watching files for change
    process.exit();
  },
  finally: mainProv.finally,
});
```

## Features

- Transpiles TypeScript files.
- Watch files for changes, so the latest
- Activates source map support.
- Replaces import aliases with tsconfig-paths.

## How it works

- Jacs creates a worker thread, and makes it ready for execution.
- When the executed script requires a source file, the following happens:
  1.  It requests the file from the main thread and sleeps by `Atomics.wait`
  2.  Jacs transpiles the file and caches it.
  3.  Stores the file in shared memory, and wakes the worker thread.
  4.  The worker thread continues as if the source code came from disc.

## Limitations

- Only support transpile.
- Only support a single tsconfig.json. Because tsconfig-paths works that way.
- Hardcoded to emit CommonJS modules.

## License

MIT
