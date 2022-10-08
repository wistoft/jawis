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

## Known issues

- There is no viable way to support ES modules.
- They are loaded async, so it's not simple to load them, when functions are
  called and needs to be loaded.
- Possible workarounds:
  1. A solution could be `deasync`, but it can't be called in all contexts.
  2. Transpile ES modules and load them as CommonJS modules. But that is likely
     to give unexpected results.
  3. Simply locate all ES modules at first execution. Cache which modules have
     no ES modules below them. They are the ones we can lazy load.

## Related work

- [import-lazy](https://www.npmjs.com/package/import-lazy)
- [lazy-require](https://www.npmjs.com/package/lazy-require)

## License

MIT
