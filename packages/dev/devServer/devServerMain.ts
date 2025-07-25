import { startJaviServer } from "^javi";
import { MainProv } from "^jab-node";
import { beeMainWrapper } from "^main-wrapper";
import { BeeMain, BeeProv } from "^bee-common";

import { makeDevDeps } from "./makeDevDeps";

/**
 *
 */
const mainInner = (beeProv: BeeProv) => async (mainProv: MainProv) => {
  const deps = await makeDevDeps(beeProv.sendLog, mainProv);

  startJaviServer(deps);
};

export const main: BeeMain = (beeProv) => {
  beeMainWrapper({
    sendLog: beeProv.sendLog,
    main: mainInner(beeProv),
  });
};
