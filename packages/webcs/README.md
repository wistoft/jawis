# Web compile service

Express route that exposes an end-point for serving source files to the browser
in development. Files are compiled by webpack, but they don't need to be
statically declared in `webpack.config.js`. All source files can be served on
demand.

## Installation

```
npm i webcs
```

## Usage

```js
import path from "path";
import express from "express";
import expressWs from "express-ws";
import { makeCsRoute } from "webcs";

// make the middleware

const { webcsRoute } = makeCsRoute({
  compileServiceRoot: __dirname,
  webRootUrl: "http://localhost:3000",
  webcsMountPath: "webcs",
  staticWebFolder: "probably just for javi",
});

// make the express app

const app = express();

expressWs(app);

app.use("webcs", webcsRoute());

app.listen(3000);

// now a file `hello.ts` is ready for the browser at:
// http://localhost:3000/webcs/hello.ts
```

## Related work

- [webpack-dev-middleware](https://www.npmjs.com/package/webpack-dev-middleware)

## License

MIT
