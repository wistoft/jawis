# Jagov

Show output from both node and browser in the browser

## Installation

```
npm i jagov
```

## Usage of Console

### Capture the console data in the browser, by loading this script file:

```
@jawis/console/consoleCaptureMain.js
```

### Make a component you can place where the console should be presented.

```js
import React, { useState } from "react";
import { makeUseConsoleStream } from "@jawis/console";
import { Console } from "@jawis/jagov";

export const MyConsole: React.FC = () => {
  const [useConsoleStream] = useState(makeUseConsoleStream);

  return (
    <Console
      //use the data captured in the browser.
      useConsoleStream={useConsoleStream}
      //get console output on the server.
      apiPath={"localhost/jago"}
      projectRoot={""}
    />
  );
};
```

## Known issues

## Related work

- [ouch](https://www.npmjs.com/package/ouch)
- [clerk notebook](https://nextjournal.github.io/clerk-demo/notebooks/introduction.html)

## License

MIT
