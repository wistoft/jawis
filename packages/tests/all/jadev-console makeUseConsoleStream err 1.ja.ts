import { makeUseConsoleStream } from "^console";
import { TestProvision } from "^jarun";

//there is no global window variable

declare let global: any;

export default (prov: TestProvision) => {
  delete global.window;
  makeUseConsoleStream();
};
