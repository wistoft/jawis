# Loop Controller

Controls serial execution of promises

## Installation

```
npm i loop-controller
```

## Usage

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

// at any point call

lc.pause();
lc.resume();
lc.setArray();
lc.prependArray();
```

### testing

The underlying waiter is exposed, to it's possible to 'hook' into the loop
controller's transitions.

```ts
//await first iteration finishes, and pause it.

lc.waiter.await("iteration-done").then(() => {
  //LoopController will receive a pause command in a certain state.
  lc.pause();
});
```

This way we can 'inject' actions when `LoopController` makes state transitions
or emit events. It's a powerful way to do white-box testing.

## Known issues

## Related work

- [p-queue](https://www.npmjs.com/package/p-queue)

## License

MIT
