# Basic utilities for JavaScript

Collection of basic utilities for JavaScript. Can be used in both node and web
projects.

## Installation

```
npm i @jawis/jab
```

## Usage

**Documentation**: Everything is developed in TypeScript, so type declarations
are the best place to find information about the individual functions and
classes.

Here are some highlights:

- **getProtoChain**: Returns the prototype chain of an object as an array of
  'class' names.

## Build

All imports are side effect free. So this library is ideal for tree-shaking.

## Known issues

- capture
  - Handles binary data superficially.
  - Sparsity in arrays is not preserved.
  - Non-enumerable properties is not preserved.

## Related work

- Capture:
  [Several](https://npmtrends.com/@stdlib/utils-native-class-vs-arson-vs-error-to-json-vs-lave-vs-serialize-error-vs-serialize-javascript-vs-uneval)

## License

MIT
