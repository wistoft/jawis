import { TestProvision } from "^jarun";

import { getJabProcess_ready } from "../_fixture";

// double shutdown

export default (prov: TestProvision) =>
  getJabProcess_ready(prov).then((proc) => proc.shutdown().then(proc.shutdown));
