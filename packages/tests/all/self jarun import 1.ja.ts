import { TestProvision } from "^jarun";
import { getEsmProjectPath } from "^tests/_fixture";

//ensure import hasn't been transpiled.

export default (prov: TestProvision) =>
  import(getEsmProjectPath("library3.mjs")).then(({ saySomething }) => {
    saySomething();
  });
