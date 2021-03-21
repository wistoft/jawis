import { makeUseConsoleStream } from "^jadev-console";
import { TestProvision } from "^jarun";

//undone

// makeUseConsoleStream is called twice

declare let global: any;

export default (prov: TestProvision) => {
  global.window = {};
  global.window.__JadevConsoleCapture = {};

  prov.finally(() => {
    delete global.window;
  });

  makeUseConsoleStream();
  makeUseConsoleStream();
};
