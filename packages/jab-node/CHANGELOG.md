# 2.0.0

## :boom: Breaking changes

- 2nd parameter of `InMemoryBee` is constrained to messages of types extending
  `{}`
- Moved `OnError` to `@jawis/jabc`

# upcoming

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
