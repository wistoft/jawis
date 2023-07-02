# Long traces

Adds asynchronous stack traces to error objects.

The long stack is created lazily. The overhead of this module is only adding a
property to the error object, when it's thrown.

## Installation

```
npm i long-traces
```

## Usage

```js
import async_hooks from "async_hooks";
import { enable } from "long-traces";

enable(async_hooks);

// stack later in error handling

try {
  throw new Error("ups");
} catch (error) {
  //this is the stacks of all ancestors (i.e. excluding the errors own stack.)
  const longStack = error.getAncestorStackFrames();
}
```

## Known issues

- Relies on `__jawisNodeStack` set by jacs. So probably only works there.
- Has to monkey patch `Error` to get the stack when errors are thrown. This
  means the `instanceof` operator is not working properly. Might be fixable.
- Only works in node because browsers don't have the `async_hooks` API. This
  module would work in browsers with such an API available.

## Related work

- [longjohn](https://www.npmjs.com/package/longjohn)
- [trace](https://www.npmjs.com/package/trace)
- [stackup](https://www.npmjs.com/package/stackup)
- [long-stack-traces](https://www.npmjs.com/package/long-stack-traces)
- [superstack](https://www.npmjs.com/package/superstack)
- [double-stack](https://www.npmjs.com/package/double-stack)

[npmtrends.com](https://npmtrends.com/double-stack-vs-long-stack-traces-vs-longjohn-vs-stackup-vs-superstack-vs-trace)

Main inspiration is taken from
[trace](https://github.com/AndreasMadsen/trace/blob/master/trace.js) by
AndreasMadsen

## License

MIT
