# upcoming

## :bug: Bug fixes

## :tada: Enhancements

## :boom: Breaking changes

# 2.2.0

## :tada: Enhancements

- `unknownToErrorData` returns the long stack from `long-traces`, if available.
- Added `captureLongStack` that extends `captureStack` by returning stacks set
  by `long-traces`.

# 2.1.0

## :bug: Bug fixes

- Make new function: `fixErrorInheritance`, which is correct spelling of
  `fixErrorInheritence`.

## :tada: Enhancements

- Added `getRandomString` function.
- Added `deprecated` function.

# 2.0.0

## :bug: Bug fixes

- `indent` now indents first line also.

## :boom: Breaking changes

- Renamed `clone` to `capture`. Including related functions and types.
- Renamed `UnparsedStack` to `CapturedStack`.
- Renamed `JabError` to `makeJabError`. And it's not a class anymore. To avoid
  inheriting the native `Error` class.
- `CapturedStack` (inherited from @jawic/jabc) is changed by renaming type
  `node-parsed` to `parsed`.
- Renamed `Json` to `Jsonable`, and `JsonArray` to `JsonableArray`
- Increated default value in `getRandomInteger` to `Number.MAX_SAFE_INTEGER`.
- Extracted `LoopController` to own package: `loop-controler`.
- Extracted `asyncClone` to own package: `async-capture`.
- Extracted `Waiter` to own package: `state-waiter`.
- Extracted `FinallyProvider` to own package: `finally-provider`.
- Extracted functions in `async.ts` to own package: `yapu`.
  - `assertUnsettled`
  - `fullRace`
  - `getPromise`
  - `looping`
  - `nightmare`
  - `paralleling`
  - `PromiseTriple`
  - `safeAll`
  - `safeAllChoice`
  - `safeAllWait`
  - `safeCatch`
  - `safeFinally`
  - `safeRace`
  - `sleeping`
  - `sleepingValue`
  - `then`
  - `timeRace`
  - `whiling`

# 1.0.3

## :tada: Enhancements

- Add functions: `getRandomUint8Array` and `toBits`

# 1.0.2

## :tada: Enhancements

- Update `README.md`.
- Add functions
  - `assertEq`
  - `numberOfRightZeroBits`
  - `preserveHeighestBit`
  - `escapeBashArgument`
  - `once`
  - `refable`
  - `makeTypedArray`
  - `base64ToTypedArray`
