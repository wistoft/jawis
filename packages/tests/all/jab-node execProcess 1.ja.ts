import { execBee, makePlainJabProcess } from "^jab-node";
import { TestProvision } from "^jarun";

import { getScriptPath } from "../_fixture";

export default (prov: TestProvision) => {
  const { promise } = execBee(
    getScriptPath("hello.js"),
    prov.finally,
    makePlainJabProcess
  );

  return promise;
};
