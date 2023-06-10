# Lazy require with support for TypeScript

Require node modules lazily. This improves start-up times, because this work is
simply delayed. Modules are only loaded synchronously when needed.

## Installation

```
npm i lazy-require-ts
```

## Usage

A prefix must be added to source files after they have been compiled with
TypeScript. This can be done either on the fly, or in a build step.

```js
import { makePrefixCode } from "lazy-require-ts";

const prefix = makePrefixCode();

const source = "...";

const sourceWithLazyLoad = prefix + source;
```

TypeScript must be configured to emit `commonjs` modules.

## Known issues

- There is no viable way to support ES modules.
  - There's no way to construct ES modules synchronously, when fx functions are
    called.
  - There's no API hook, that allows modification of module exports. To avoid
    exporting unreachable code.
  - Possible workaround: Transpile ES modules and load them as CommonJS modules.
    But that's beyond the scope of this package.

## Related work

- [import-lazy](https://www.npmjs.com/package/import-lazy)
- [lazy-require](https://www.npmjs.com/package/lazy-require)

## License

MIT
