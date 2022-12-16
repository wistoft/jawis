import { TestProvision } from "^jarun";

import { littleLoop } from "../_fixture";

//pause after loop is done

export default (prov: TestProvision) => {
  const lc = littleLoop(prov);

  return lc.getPromise().then(() => lc.pause());
};
