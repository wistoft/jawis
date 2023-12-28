# upcoming

## :bug: Bug fixes

## :tada: Enhancements

- hardTimeout is configurable in `Waiter` constructor.
  - Its default is 300.
  - Timeout can be disabled by setting `hardTimeout` to 0.
  - Timeout will reject the `await` promise.
  - Previously it was only possible to change timeout in calls to `await`.

## :boom: Breaking changes
