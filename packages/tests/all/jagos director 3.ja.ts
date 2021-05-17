import { TestProvision } from "^jarun";

import { getScriptPath } from "../_fixture";
import { getJagosDirector_with_script } from "^tests/_fixture/testFixtures/jagos";

//start script

export default (prov: TestProvision) =>
  getJagosDirector_with_script(prov).onClientMessage({
    type: "restartScript",
    script: getScriptPath("hello.js"),
  });
