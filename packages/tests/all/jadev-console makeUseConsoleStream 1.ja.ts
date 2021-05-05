import { defaultWindowPropertyName, makeUseConsoleStream } from "^console";
import { TestProvision } from "^jarun";

//hello

declare let global: any;

export default (prov: TestProvision) => {
  global.window = {};
  global.window[defaultWindowPropertyName] = {};

  prov.finally(() => {
    delete global.window;
  });

  //test the returned useConsoleStream somehow
  makeUseConsoleStream();
};
