import { TestProvision } from "^jarun";

import { getJabProcess } from "../_fixture";

// doesn't kill the process or return promise, but it's done automatically.

export default (prov: TestProvision) => {
  getJabProcess(prov);
};
