# Utilities for nodejs.

Collection of utilities for working with nodejs environment.

## Installation

```
npm i @jawis/jab-node
```

## Known issues

- `WatchableProcessPreloader` sends required files too often. It only need files
  when they are loaded, not each time they are required.

## License

MIT
