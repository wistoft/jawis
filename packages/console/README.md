# Console

Console output from browser shown in the browser

- Use [@jawis/jagov](https://www.npmjs.com/package/@jawis/jagov) to get output
  from node scripts as well.

## Installation

```
npm i console
```

## Usage

### Capture the console data in the browser, by loading this script file:

```
@jawis/console/consoleCaptureMain.js
```

### Place the console where you like on the page.

```js
import React from "react";
import { Console } from "@jawis/console";

export const MyComponent: React.FC = () => (
  <>
    This is where the console output will appear:
    <Console />
  </>
);
```

## Known issues

## Related work

- [react-error-overlay](https://www.npmjs.com/package/react-error-overlay)
- [redbox-react](https://www.npmjs.com/package/redbox-react)
- [error-overlay-webpack-plugin](https://www.npmjs.com/package/error-overlay-webpack-plugin)
- [pretty-error](https://www.npmjs.com/package/pretty-error)

## License

MIT
