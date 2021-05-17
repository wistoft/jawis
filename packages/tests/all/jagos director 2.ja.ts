import { TestProvision } from "^jarun";

import { getJagosDirector_with_script } from "^tests/_fixture/testFixtures/jagos";

//on start listen

export default (prov: TestProvision) => {
  getJagosDirector_with_script(prov).onClientMessage({ type: "startListen" });
};
