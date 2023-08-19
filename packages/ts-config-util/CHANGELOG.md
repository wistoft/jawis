# upcoming

## :bug: Bug fixes

## :tada: Enhancements

## :boom: Breaking changes

- Remove `typescript` as peerDependency, because it's not a sufficient
  constraint.
- Typescript is taken as a parameter to ensure it's the same version as the
  caller's.
  - `getAbsConfigFilePath`
  - `getTsConfigFromAbsConfigFile`

# 0.0.3

## :tada: Enhancements

- Add `sideEffects` to `package.json`
