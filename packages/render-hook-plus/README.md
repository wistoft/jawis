# Render hook plus

Improved version of `renderHook` from the library
[@testing-library/react-hooks](https://www.npmjs.com/package/@testing-library/react-hooks)

## Installation

```
npm i render-hook-plus
```

## Usage

```js
import { renderHook } from "render-hook-plus";

// Arguments to the hook (useCounter) are taken as additional arguments.
const { result, unmount, hook, rerender } = renderHook(
  useCounter,
  7 /* initial value */
);

// `result` contains the return value from the first hook render, done when calling `renderHook`.

assert(result.count === 7); // the initial value in the counter.

// `rerender` function takes no arguments and will user the arguments
//  from last render. It returns the value from the hook.

assert(rerender().count === 7); //same value, because render doesn't change the value.

// you can check `useCounter` returns the same function reference in the two renders.

assert(result.increment === rerender().increment);

// `hook` function takes the same arguments as the original hook. And can be
//  called to rerender with new arguments.

result.increment();

assert(rerender().count === 8); //check the increment happened.
```

## Difference from `@testing-library/react-hooks`

- Errors are thrown, not returned.
- rerender returns hook-result.
- No 'current' variable.

## License

MIT
