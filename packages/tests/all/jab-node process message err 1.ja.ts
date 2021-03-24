import { TestProvision } from "^jarun";
import { def } from "^jab";

import { getJabProcess } from "../_fixture";

export default (prov: TestProvision) => {
  const proc = getJabProcess(prov);
  return proc.shutdown().then(() => def(proc).send("message to dead process."));
};
