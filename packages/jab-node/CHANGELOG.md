# upcoming

## :bug: Bug fixes

- Removed unused dependency: `dateformat`
- ProcessPreloader gave wrong error message. It happened if a message was
  received from ProcessPreloaderMain _between_ `kill` and `onExit`.
- WatchableProcessPreloader didn't protect properly against double use. It mixed
  the deps for the first and second call to `useProcess`.

## :tada: Enhancements

## :boom: Breaking changes

# 4.0.0

## :boom: Breaking changes

- Moved to new package: `main-wrapper`
  - `UserMessage`
  - `mainProvToConsole`
  - `makeOnErrorToConsole` => `onError`
  - `makeLogServiceToConsole`
  - `mainWrapper`

# 3.0.0

## :tada: Enhancements

- Added options to `exec`. It takes the same options as `child_process.spawn`.
- Added `registerErrorHandlers` and `postMessage`, which are agnostic to running
  in worker or process.
- Made `httpRequest` support https.

## :bug: Bug fixes

## :boom: Breaking changes

- Moved functions and classes to new package `bee-common`

  - `execBee`
  - `mainProvToJago` => `makeMainBeeProv`
  - `makeJagoLogProv` => `makeBeeLogProv`
  - `makeJagoOnError` => `makeBeeOnError`
  - `InMemoryBee`

- Moved types to new package `bee-common`

  - `JabShutdownMessage` => `BeeShutdownMessage`
  - `JagoSend` => `SendBeeLog`
  - `BeeDeps`
  - `BeeListeners`
  - `Bee`
  - `MakeBee`
  - `ExecBee`
  - `BeeResult`

- Moved function to `javi`
  - `makeMakeTsJabProcessConditonally` => `makeMakeTsJabProcessConditionally`

# 2.0.0

## :boom: Breaking changes

- 2nd parameter of `InMemoryBee` is constrained to messages of types extending
  `{}`
- Moved `OnError` to `@jawis/jabc`
