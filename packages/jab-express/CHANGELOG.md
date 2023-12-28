# upcoming

## :bug: Bug fixes

## :tada: Enhancements

- Increase support of `ws` from `^8.5.0` to `^8.0.0`
- Increase support of `express` from `^4.17.3` to `^4.8.0`
- Increase support of `@types/ws` from `^8.5.2` to `^8.5.0`
- Increase support of `@types/express` from `^4.17.11` to `^4.0.35`
- Remove dependency on `@types/express-ws`.
- Make `NodeWs` compatible with node 20

## :boom: Breaking changes

# 2.1.0

## :tada: Enhancements

- Added `makeGeneralRouter`

# 2.0.0

## :boom: Breaking changes

- new versions of express, ws and express-ws
- Removed things
  - `makeMakeRouter`
  - `MakeServerAppRouter`
  - `MakeServerApp`
  - `WsMessageListenerOld`
  - `WsRouter`
  - `makeApp`, `Route`, `RouteDeps`

# 1.0.4

## :bug: Bug fixes

- Fix missing dependencies.
  - Add `yapu`
  - Remove need for `express-serve-static-core`
