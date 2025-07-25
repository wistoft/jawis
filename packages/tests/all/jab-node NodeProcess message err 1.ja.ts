import { TestProvision } from "^jarun";
import { def } from "^jab";

import { getNodeProcess } from "../_fixture";

//send after shutdown

export default (prov: TestProvision) => {
  const proc = getNodeProcess(prov);
  return proc.shutdown().then(() => def(proc).send("message to dead process."));
};
