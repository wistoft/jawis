import { TestProvision } from "^jarun";

import { getTestListController } from "../_fixture";

export default (prov: TestProvision) => {
  const tc = getTestListController(prov);

  return tc.onRunDtp();
};
