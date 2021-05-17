import { TestProvision } from "^jarun";

import { getScriptPath } from "../_fixture";
import { getJagosDirector } from "^tests/_fixture/testFixtures/jagos";

//shutdown with started script: is just silent

export default (prov: TestProvision) => {
  const script = getScriptPath("hello.js");

  const director = getJagosDirector(prov, {
    scripts: [{ script }],
  });

  director.onClientMessage({ type: "restartScript", script });
};
