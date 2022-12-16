# Basic utilities for JavaScript

Collection of basic utilities for JavaScript. Can be used in both node and web
projects.

## Installation

```
npm i @jawis/jab
```

## Usage

**Documentation**: Everything is developed in TypeScript, so type declarations
are the best place to find information about the individual functions and
classes.

Here are some highlights:

### Waiter

`Waiter` is meant to be used by an object, that wishes to keep control over
asynchronous state.

Injecting actions synchronous on state transition or emits events could break
its assumptions. One would have to ensure actions have finished and the object
is ready for the next tick. But it's worthwhile to have that extra constraint,
because it's possible to inject actions at precise transitions or event, which
makes white-box test possible. The test case essentially because deterministic.

### FinallyProvider

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

### Small utilities

- **getProtoChain**: Returns the prototype chain of an object as an array of
  'class' names.

## Build

All imports are side effect free. So this library is ideal for tree-shaking.

## Known issues

- indent has a bug.
- clone
  - Handles binary data superficially.
  - Sparsity in arrays is not preserved.
  - Non-enumerable properties is not preserved.
- ES6 is required minimum. Because `JabError` inherits from `Error`

## Related work

- Capture:
  [Several](https://npmtrends.com/@stdlib/utils-native-class-vs-arson-vs-error-to-json-vs-lave-vs-serialize-error-vs-serialize-javascript-vs-uneval)

## License

MIT
