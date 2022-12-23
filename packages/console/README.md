# Console

Console output from browser shown in the browser

- Use @jagov/Console to get output from node scripts as well.

## Installation

```
npm i console
```

## Usage

### Captures the console data in the browser, by loading this script file:

```
@jawis/console/consoleCaptureMain.js
```

### Make a component you kan place wher the console should be presented.

```js
import { makeUseConsoleStream, View } from "console";

export const MyConsole: React.FC<Props> = () => {
  const [useConsoleStream] = useState(makeUseConsoleStream);

  return <View useConsoleStream={useConsoleStream} />;
};
```

## Known issues

## Related work

- [react-error-overlay](https://www.npmjs.com/package/react-error-overlay)
- [redbox-react](https://www.npmjs.com/package/redbox-react)
- [error-overlay-webpack-plugin](https://www.npmjs.com/package/error-overlay-webpack-plugin)
- [pretty-error](https://www.npmjs.com/package/pretty-error)

## License

MIT
