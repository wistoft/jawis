# Finally Provider

Register functions for execution at a later time.

## Installation

```
npm i finally-provider
```

## Usage

Provides the ability to register functions, that should be executed before
shutdown.

```ts
const finalProv = new FinallyProvider({
  onError: console.log,
});

//Execute where needed

finalProv.finally(() => {
  console.log("Clean up stuff here.");
});

//Execute just before shutdown

finalProv.runFinally().then(() => {
  console.log("Ready to exit.");
});
```

## Known issues

## Related work

- [finally-aggregator](https://www.npmjs.com/package/finally-aggregator)

## License

MIT
