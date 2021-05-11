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
