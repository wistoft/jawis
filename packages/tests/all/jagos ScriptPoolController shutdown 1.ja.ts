import { TestProvision } from "^jarun";

import { getJabScriptPoolController_new } from "../_fixture";

export default (prov: TestProvision) =>
  getJabScriptPoolController_new(prov).shutdown();
