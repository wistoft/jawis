import { TestProvision } from "^jarun";

import { getReusableWPPAndDeps, makeDormentInMemoryBee } from "../_fixture";

//shutdown, before process has returned.

export default (prov: TestProvision) => {
  const [angel] = getReusableWPPAndDeps(prov, {
    makeBee: makeDormentInMemoryBee,
  });

  return angel.noisyKill();
};
