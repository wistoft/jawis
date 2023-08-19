# upcoming

## :bug: Bug fixes

- Add missing `props.children` in `TogglePanel` type.

## :tada: Enhancements

- Increase support of `@types/react` from `^16.14.4` to `^16.8.0`
- Widen `ReactElement` to `ReactNode` in `RouteDef` and `ComponentMenuProps`
  types.

## :boom: Breaking changes

- Switch from `@reach/router` to `react-router`
- Removed `useUseFirstRouteEffect` and `UseFirstRouteEffectContext` ther are
  implementation details.

# 2.0.0

## :bug: Bug fixes

- `makeUseFunction` had a generic type without constraint. Now it has the type
  `D extends {}`

## :boom: Breaking changes

- Moved functions and classes to new package `react-use-ws`
  - `BrowserWebSocket`
  - `useWebSocketProv`
  - `makeUseWsEffect`
