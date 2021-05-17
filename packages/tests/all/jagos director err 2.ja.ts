import { TestProvision } from "^jarun";

import { getJagosDirector } from "^tests/_fixture/testFixtures/jagos";

//start unknown script

export default (prov: TestProvision) => {
  getJagosDirector(prov).onClientMessage({
    type: "restartScript",
    script: "dontExist",
  });
};
