# upcoming

## :bug: Bug fixes

- Director waits for its work before shutdown resolves.

## :tada: Enhancements

- Increase support of `express` from `^4.17.3` to `^4.8.0`
- Increase support of `@types/express` from `^4.17.11` to `^4.0.35`

## :boom: Breaking changes

# 3.0.0

## :tada: Enhancements

- Trimmed dependencies

## :boom: Breaking changes

- Removed dtp.
- Director deps is changed
  - Added: `handleOpenFileInEditor`, `compareFiles`
- `makeJatesRoute` returns a plain `express.Router`

# 2.0.0

## :boom: Breaking changes

- `director.ts/Deps` is renamed to `DirectorDeps`.
- Web socket messages are slightly changed. See `@jawis/jatec`
