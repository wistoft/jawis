import { makeUseConsoleStream } from "^jadev-console";
import { TestProvision } from "^jarun";

//hello

declare let global: any;

export default (prov: TestProvision) => {
  global.window = {};
  global.window.__JadevConsoleCapture = {};

  prov.finally(() => {
    delete global.window;
  });

  //test the returned useConsoleStream somehow
  makeUseConsoleStream();
};
