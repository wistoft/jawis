import { makeUseConsoleStream } from "^console";
import { TestProvision } from "^jarun";

//there is no global window variable

export default (prov: TestProvision) => {
  makeUseConsoleStream();
};
