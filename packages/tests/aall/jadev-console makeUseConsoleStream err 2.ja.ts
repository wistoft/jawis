import { makeUseConsoleStream } from "^jadev-console";
import { TestProvision } from "^jarun";

// console capture isn't active

declare let global: any;

export default (prov: TestProvision) => {
  global.window = {};

  prov.finally(() => {
    delete global.window;
  });

  makeUseConsoleStream();
};
