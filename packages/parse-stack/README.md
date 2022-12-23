# Parse stack traces

Wrappers around established stack-parsing libraries.

## Installation

```
npm i parse-stack
```

## Usage

### Capture stacks

- Stacks are captured in the runtime they occur in, producing a `CapturedStack`
  object. Use the function `@jawis/jab#captureStack` to do this.

### Parse general errors

Stacks captured in unknown location can be parsed for presentation.

- `parseTrace`

### Parse browser errors

They can be source mapped, if they are presented in the same browser, as they
are captured. Because then the source map will be cached in the browser and it
will match the source code.

- `parseTraceAndSourceMap`

## Known issues

## Related work

**The libraries used for parsing stacks:**

- [stack-trace](https://www.npmjs.com/package/stack-trace)
- [stacktrace-js](https://www.npmjs.com/package/stacktrace-js)
- [stacktrace-gps](https://www.npmjs.com/package/stacktrace-gps)
- [error-stack-parser](https://www.npmjs.com/package/error-stack-parser)

## License

MIT
