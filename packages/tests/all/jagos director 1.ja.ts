import { TestProvision } from "^jarun";

import { getJagosDirector } from "^tests/_fixture";

//stop all, when nothing is running.

export default (prov: TestProvision) => {
  getJagosDirector(prov).onClientMessage({ type: "stopAll" });
};
