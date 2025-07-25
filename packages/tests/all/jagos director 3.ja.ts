import { TestProvision } from "^jarun";

import { getJagosDirector_with_script } from "^tests/_fixture";
import { getScriptPath } from "../_fixture";

//start script

export default (prov: TestProvision) =>
  getJagosDirector_with_script(prov).onClientMessage({
    type: "restartScript",
    script: getScriptPath("silent.js"),
    data: { dum: "dummy" },
  });
