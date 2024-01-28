# upcoming

## :bug: Bug fixes

## :tada: Enhancements

- hardTimeout is configurable in `Waiter` constructor.
  - Its default is 300.
  - Timeout can be disabled by setting `hardTimeout` to 0.
  - Timeout will reject the `await` promise.
  - Previously it was only possible to change timeout in calls to `await`.
- Add the timeout amount to timeout-error-messages.
- export `WaiterDeps`
- Add setGlobalHardTimeout_experimental. It can set the default timeout in
  `Waiter`, which is otherwise impossible when `Waiter` is composed by other
  objects.

## :boom: Breaking changes
