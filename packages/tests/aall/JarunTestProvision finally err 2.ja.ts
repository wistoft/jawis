import { TestProvision } from "^jarun";

import { getJarunTestProvision_inactive } from "../_fixture";

// finally function not allowed after finalize.

export default (prov: TestProvision) =>
  getJarunTestProvision_inactive(prov).then((jtp) => {
    jtp.finally(() => {});
  });
