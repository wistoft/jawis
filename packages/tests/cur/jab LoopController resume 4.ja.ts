import { TestProvision } from "^jarun";

import { littleLoop } from "../_fixture";

//resume when done

export default (prov: TestProvision) => {
  const lc = littleLoop(prov);

  return lc.getPromise().then(() => lc.resume());
};
