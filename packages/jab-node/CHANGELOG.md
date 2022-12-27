# 2.0.0

## :boom: Breaking changes

- 2nd parameter of `InMemoryBee` is constrained to messages of types extending
  `{}`
- Moved `OnError` to `@jawis/jabc`

# upcoming

## :tada: Enhancements

## :bug: Bug fixes

## :boom: Breaking changes

- Moved functions and classes to new package `bee-common`

  - `execBee`
  - `mainProvToJago`
  - `makeJagoLogProv`
  - `makeJagoOnError`
  - `InMemoryBee`

- Moved types to new package `bee-common`
  - `JabShutdownMessage`
  - `JagoSend`
  - `BeeDeps`
  - `BeeListeners`
  - `Bee`
  - `MakeBee`
  - `ExecBee`
  - `BeeResult`
