const webpackRequire = require as __WebpackModuleApi.RequireFunction;

//note: webpack context only takes string literals as arguments. Because it's processsed at compile time.

export const devComponents = [
  {
    folder: "hello web",
    context: webpackRequire.context("../_dev_hello_web", false, /.tsx?/),
  },
  {
    folder: "hello react",
    context: webpackRequire.context("../_dev_hello_react", false, /.tsx?/),
  },
  {
    folder: "jawis",
    context: webpackRequire.context("../_dev_jawis", false, /.tsx?/),
  },
];
