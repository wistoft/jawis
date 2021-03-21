# @wistoft/jab

JavaScript basic is a collection of utilities. Can be used in both node and web
projects.

## Installation

```
yarn add @wistoft/jab
```

or

```
npm i @wistoft/jab
```

## Usage

**Documentation**: Everything is developed in TypeScript, so type declarations
are the best place to find information about the individual functions and
classes.

Here are some highlights:

### Waiter

`Waiter` is meant to be used by an object, that wishes to keep control over
asynchronous state. It's most instructive to show how `LoopController` gives
access to its underlying `Waiter`.

```ts
//create a loop controller, that runs five iterations.
//It starts execution automatically.

const lc = new LoopController({
  arr: [1, 2, 3, 4, 5],
  makePromise: (index) => {
    console.log("iteration: " + index);
    return sleeping(10);
  },
  onError: console.log,
});

//await first iteration finishes, and pause it.

lc.waiter.await("iteration-done").then(() => {
  //LoopController will receice a pause command
  // in a certain state.
  lc.pause();
});
```

This way we can 'inject' actions when `LoopController` makes state transitions
or emit events. It's a powerful way to do white-box testing.

The example is a little flaky though. There's no guarantee when the pause will
execute. So `Waiter` should also support callback style. The promise style is
less intrusive though. Injecting actions synchronous when `LoopController`
changes state or emits events could break its assumptions. One would have to
ensure it has finished its execution for the current tick, when it set state or
emits event.

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

## License

MIT
