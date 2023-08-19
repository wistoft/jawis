# upcoming

## :bug: Bug fixes

## :tada: Enhancements

- Increase support of `express` from `^4.17.3` to `^4.8.0`
- Increase support of `@types/express` from `^4.17.11` to `^4.0.35`

## :boom: Breaking changes

# 3.1.0

## :tada: Enhancements

- Made `ScriptPoolControler` part of public API.

# 3.0.0

## :tada: Enhancements

- Trimmed dependencies

## :boom: Breaking changes

- Director deps is changed
  - Removed: `projectRoot`
  - Added: `handleOpenRelativeFileInEditor` `handleOpenFileInEditor`
- `makeJagosRoute` returns a plain `express.Router`

# 2.0.0

## :boom: Breaking changes

- `director.ts/Deps` is renamed to `DirectorDeps`.
