import { TestProvision } from "^jarun";

import { getJarunTestProvision } from "../_fixture";

export default (prov: TestProvision) => {
  prov.imp(getJarunTestProvision(prov).logs);
};
