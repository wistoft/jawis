import { TestProvision } from "^jarun";

import { getJarunTestProvision_inactive } from "../_fixture";

export default (prov: TestProvision) =>
  getJarunTestProvision_inactive(prov).then((jtp) => {
    jtp.chk(true);
  });
