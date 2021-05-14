# 0.0.31

## :boom: Breaking changes

- Increase timeout in jacs to `10s`.
- Introduce soft timeout is jacs. It gives a warning, but waits for producer to
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
