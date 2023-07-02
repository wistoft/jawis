# State-Waiter

Handle async states conveniently.

- Stores the state and make it easy for test cases to hook into transitions.
- Makes it easy to write shutdown and kill methods. Just supply and
  implementation.

## Installation

```
npm i state-waiter
```

## Usage

### end state

If the `end` state is defined, it is possible to use the method `Waiter.onClose`
as a callback. The waiter will go into `end` state immediately, because that's
wait the close event means.

### shutdown and kill actions

- Waiter implements wrappers for shutdown and kill to make it easier to
  explicitly transition to `end` state.
- For sync shutdown and kill waiter goes into `end` state immediately. For async
  it goes into 'stopping' until the shutdown/kill implementation has finished.
- Shutdown/kill can be called as many times in what ever order from the outside,
  the transition will be the same, and all calls will resolve when `end` state
  is reached.
- Shutdown implementation should do a graceful shutdown. Shutdown implementation
  will only be called once. Shutdown will not be called if kill already has been
  called.
- Kill implementation should do efficient shutdown (no grace). Kill
  implementation will be called each time kill is called.

### Waiting for state changes or events

Has limitations, so only useful for testing, for now.

Injecting actions synchronous on state transition or emits events could break
its assumptions. One would have to ensure actions have finished and the object
is ready for the next tick. But it's worthwhile to have that extra constraint,
because it's possible to inject actions at precise transitions or event, which
makes white-box test possible. The test case essentially because deterministic.

## Known issues

## Related work

- [xstate](https://www.npmjs.com/package/xstate) gives a DSL to define
  finite-state machines and hooks into transitions. And tools for visualizing
  transition graphs.
- [jssm](https://www.npmjs.com/package/jssm) similar to `xstate`

## API

### Waiter: class<States, Events = never>(deps)

Class for representing a waiter.

Parameters:

- _deps_: Configuration for the waiter.
  ```ts
  object: {
    startState: States;
    stoppingState?: States;
    endState?: States;
    onError: (error: unknown) => void;
  };
  ```

### waiter.getState: () => States

_Return_: The current state.

### More methods exists: See source code

## License

MIT
