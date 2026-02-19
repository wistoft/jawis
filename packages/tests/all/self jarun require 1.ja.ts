import { TestProvision } from "^jarun";
import { getCommonJsProjectPath, getEsmProjectPath } from "^tests/_fixture";

//ensure code can be loaded.

export default (prov: TestProvision) => {
  require(getCommonJsProjectPath("library1.js"))();
  //without js-extension and from esm project
  require(getEsmProjectPath("library1")).saySomething();
  //with js-extension and from esm project
  require(getEsmProjectPath("library3.mjs")).saySomething();
};
