# @wistoft/jab-react

Collection of utilities for working with react.

## Installation

```
yarn add @wistoft/jab-react
```

or

```
npm i @wistoft/jab-react
```

## Known issues

- BrowserWebSocket is superfluously implemented
- BrowserWebSocket reconnects too much, and causes the browser to make
  'exponential' increasing timeouts.
- ScrollbarTail is broken in React 17.

## License

MIT
