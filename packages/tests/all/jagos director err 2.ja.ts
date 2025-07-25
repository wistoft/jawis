import { TestProvision } from "^jarun";

import { getJagosDirector } from "^tests/_fixture";

//start unknown script

export default (prov: TestProvision) =>
  getJagosDirector(prov).onClientMessage({
    type: "restartScript",
    script: "dontExist",
    data: { dum: "dummy" },
  });
