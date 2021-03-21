import { TestProvision } from "^jarun";

import { getJabScriptPoolController } from "../_fixture";

//doesn't return

export default (prov: TestProvision) => {
  getJabScriptPoolController(prov);
};
