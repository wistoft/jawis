# useWebsocket

React hook to open/close a websocket connection when a component
mounts/unmounts.

## Installation

```
npm i react-use-ws
```

## Usage

## Known issues

- BrowserWebSocket is superfluously implemented
- BrowserWebSocket reconnects too much, and causes the browser to make
  'exponential' increasing timeouts.

## Related work

- [react-use-websocket](https://www.npmjs.com/package/react-use-websocket)

## License

MIT
