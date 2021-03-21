import React, { memo } from "react";
import { DevComponentPanel } from "^jawis-mess/web";
import { mapContext } from "^jawis-mess";

const webpackRequire = require as __WebpackModuleApi.RequireFunction;

//note: webpack context only takes string literals as arguments. Because it's processsed at compile time.
const contexts = [
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

//this mapping is done at runtime
const folders = contexts.map((elm) => ({
  folder: elm.folder,
  comps: mapContext(elm.context),
}));

/**
 *
 */
export const DevComponents: React.FC = memo(() => (
  <DevComponentPanel folders={folders} />
));

DevComponents.displayName = "DevComponents";
