import fs from "node:fs";

import { TestProvision } from "^jarun";
import { getPromiseNodeStyle } from "^yapu";

// no stack trace at all.

//see https://github.com/nodejs/node/issues/30944

export default (prov: TestProvision) => {
  const prom = getPromiseNodeStyle<any>();

  const outer = () => {
    fs.stat("asdf", prom.callback);
  };

  outer();

  return [prom.promise, fs.promises.readFile("doesntexist")];
};
