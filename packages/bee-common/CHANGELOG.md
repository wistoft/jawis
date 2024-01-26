# upcoming

## :bug: Bug fixes

## :tada: Enhancements

- Add `onTerminate` callback to `InMemoryBee`

## :boom: Breaking changes

- Termination of `InMemoryBee` is changed, so `exit` event isn't emitted
  synchronously in calls to the methods `shutdown`, `kill` and `noisyKill`

# 0.2.0

## :tada: Enhancements

- Added
  - `tryHandleBeeLogChannel`
  - `BeePreloaderProv`
  - `NoopBeePreloader`

# 0.1.0

## :tada: Enhancements

- Added `BeeProv` as abstraction for runtime specific features.

# 0.0.2

## :bug: Bug fixes

- Fix missing dependency `@jawis/jabc`
