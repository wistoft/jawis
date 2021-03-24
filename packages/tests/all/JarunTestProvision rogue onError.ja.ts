import { TestProvision } from "^jarun";

import { getJarunTestProvision_inactive } from "../_fixture";

//error after test ends.

export default (prov: TestProvision) =>
  getJarunTestProvision_inactive(prov).then((jtp) => {
    jtp.onError(new Error("hello"));
  });
