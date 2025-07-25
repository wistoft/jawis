import { defaultWindowPropertyName, makeUseConsoleStream } from "^console";
import { TestProvision } from "^jarun";

//undone

// makeUseConsoleStream is called twice

declare let global: any;

export default (prov: TestProvision) => {
  global.window = {};
  global.window[defaultWindowPropertyName] = {};

  prov.finally(() => {
    delete global.window;
  });

  makeUseConsoleStream();
  makeUseConsoleStream();
};
