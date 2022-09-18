# Lazy Require with support for TypeScript

## Installation

```
npm i lazy-require-ts
```

## Usage

## Known issues

- There is no viable way to support ES modules.
 - They are loaded async, so it's not simple to load them, when functions is called
  and needs to be loaded.
  - Possible workarounds:
    1) A solution could be `deasync`, but it can't be called in every context.
    2) Transpile ES modules and load them as CommonJS modules. But that is likely to give unexpected results.
    3) Simply locate all ES modules at first execution. Cache which modules have no ES modules below them. They are the ones we can lazy load.

## Related work

 - [import-lazy](https://www.npmjs.com/package/import-lazy)
 - [lazy-require](https://www.npmjs.com/package/lazy-require)

## License

MIT
