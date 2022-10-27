# Jagov

The view part of jago.

- And Console: show output from both node and browser shown in the browser

## Installation

```
npm i jagov
```

## Usage of Console

### Captures the console data in the browser, by loading this script file:

```
@jawis/console/consoleCaptureMain.js
```

### Make a component you kan place where the console should be presented.

```js
import { makeUseConsoleStream } from "console";
import { Console } from "@jawis/jagov";

export const MyConsole: React.FC<Props> = () => {
  const [useConsoleStream] = useState(makeUseConsoleStream);

  return (
    <Console
      useConsoleStream={useConsoleStream}
      apiPath={"http://localhost/jago"}
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
