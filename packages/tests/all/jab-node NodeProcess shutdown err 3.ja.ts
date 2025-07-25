import { TestProvision } from "^jarun";

import { getNodeProcess_ready } from "../_fixture";

// double shutdown

export default (prov: TestProvision) =>
  getNodeProcess_ready(prov).then((proc) =>
    proc.shutdown().then(proc.shutdown)
  );
