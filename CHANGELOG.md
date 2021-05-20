# 1.0.0

## :tada: Enhancements

- `Jarun` handles tests, that export: `module.exports = () => {}`, as one would
  do in js-files.
- `Jago` shows 'No scripts', when appropriate, instead of blank page.
- Removed `@reach/router` dependency in `console`.

## :bug: Bug fixes

- `Jacs` worker failed when both `baseUrl` and `paths` are undefined.
- `Jates` threw when cur-test-folder doesn't exist.
- `Javi` didn't recognize `testLogFolder` in `javi.conf` correctly.
- `Jacs` threw if `baseUrl` was unspecified in `tsconfig.json`. Now it uses
  `tsconfig.json`'s position as `baseUrl`.
- When jago stops all scripts, it will kill scripts that doesn't respond to
  shutdown signal. Just like `jago` does when killing a single script.

## :boom: Breaking changes

# 0.0.36

## :tada: Enhancements

- Clean up dependencies in `javi` and `jab-node`.

## :bug: Bug fixes

- Add `ts-node` dependency to `util` package.

## :boom: Breaking changes

- Move `NodeWS` and `Server` from `jab-node` to `jab-express`.
- Move `getFunctionNameFromFrame` and `extractStackTraceInfo` from `jab-node` to
  `jacs`.

# 0.0.35

## :tada: Enhancements

- When files/folders specified in `javi.conf` doesn't exist a useful message is
  printed to the console. Except for `test log folder`, it will be created, when
  the user accepts a test log.
- `makeLogServiceToConsole` has optional logPrefix. And delay is now
  configurable.
- Better output from `jab-node.makeOnErrorToConsole`.

## :bug: Bug fixes

- `jatev` filters empty levels in test selection away, so it's easy to
  determine, when there's no test cases.
- Default scriptFolders in `javi.conf.js` is correctly set to current work dir.
- Don't throw when `jatev` has no test selection and receives a test result. It
  can occur when a page is reloaded, and an old test report is received before
  the test selection arrives.
- Only show js and ts-files in `jago`.

## :boom: Breaking changes

- Increase jacs soft timeout to `3s`.
- When unknown properties in `javi.conf` are specified, an error is thrown.
- Removed logPrefix from `jab-node.makeOnErrorToConsole`

# 0.0.34

## :boom: Breaking changes

- Move `createWebpackBaseConf` from `util` package to `util-dev`

# 0.0.32

## :boom: Breaking changes

- Renamed package `jawis-util` to `util`.

# 0.0.31

## :boom: Breaking changes

- Increase timeout in jacs to `10s`.
- Introduce soft timeout in jacs. It gives a warning, but waits for producer to
  respond. Default `1s`.

# 0.0.30

## :tada: Enhancements

- `Jates` stops test execution if test frameworks reject in `runTest`. Because
  it's a system error, and `TestExecutionController` has no way to recover.
- Timeout in `TestExecutionController` is configurable in `javi.conf`.

## :boom: Breaking changes

- `execBee` resolves rather than reject, when there are errors. So it's possible
  to return the other information from the bee. Like stdout.
- `BeeRunner`: When the tests throw, stdout, etc. is also logged.

# 0.0.29

## :bug: Bug fixes

- Don't throw when `jatev` receives the result of an unknown test. It can occur
  when test selection is changed in the view, and the result from an old test
  selection is received.
- Remove unintended `console.log` in `ViewExceptionCallStack`

# 0.0.28

## :tada: Enhancements

- `console` handles the new stack type in `UnparsedStack`.
- When `console` opens stack frames in vscode, files in node_modules, that have
  source-map, are opened correctly, by not using source-mapping in this case.

## :boom: Breaking changes

- When errors are serialized, 'parsed trace' from jacs is captured. Widening the
  `UnparsedStack` type.

# 0.0.27

## :tada: Enhancements

- Jacs supports uninstall.
- `Jacs.install` makes jacs usable programmatically.
- `JacsConsumer.unregiter` is implemented.

# 0.0.26

7 May 2021

## :tada: Enhancements

- Jacs decorates errors with a `__jawisNodeStack` property, that contains a
  'parsed' stack trace. Including non-source-mapped file and line, if different
  from source-mapped values.

## :boom: Breaking changes

- Jacs sets `Error.stackTraceLimit` to Infinity. To preserve all information in
  the stack trace. Not just the 10 frames, as is node's default.
