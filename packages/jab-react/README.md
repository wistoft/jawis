# Utilities for react.

Collection of utilities for working with react.

## Installation

```
yarn add @jawis/jab-react
```

or

```
npm i @jawis/jab-react
```

## Known issues

- BrowserWebSocket is superfluously implemented
- BrowserWebSocket reconnects too much, and causes the browser to make
  'exponential' increasing timeouts.
- ScrollbarTail is broken in React 17.

## License

MIT
