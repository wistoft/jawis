# State-Waiter

Handle async states conveniently.

## Installation

```
npm i state-waiter
```

## Usage

`Waiter` is meant to be used by an object, that wishes to keep control over
asynchronous state.

Injecting actions synchronous on state transition or emits events could break
its assumptions. One would have to ensure actions have finished and the object
is ready for the next tick. But it's worthwhile to have that extra constraint,
because it's possible to inject actions at precise transitions or event, which
makes white-box test possible. The test case essentially because deterministic.

## Known issues

## Related work

## License

MIT
