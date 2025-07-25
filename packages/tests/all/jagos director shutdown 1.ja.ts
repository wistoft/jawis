import { TestProvision } from "^jarun";

import { getJagosDirector } from "^tests/_fixture";
import { getScriptPath } from "../_fixture";

//shutdown with started script: is just silent

export default (prov: TestProvision) => {
  const script = getScriptPath("hello.js");

  const director = getJagosDirector(prov, {
    scripts: [{ script }],
  });

  director.onClientMessage({
    type: "restartScript",
    script,
    data: { dum: "dummy" },
  });
};
