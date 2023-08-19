import { MainProv } from "^jab-node";
import { mainWrapper } from "^main-wrapper";

import { makeMakeJacsWorkerBee } from "@jawis/jacs";

import { MakeBee } from "^bee-common";
import { startJaviTest } from "^javi/internal";

const main = (mainProv: MainProv) => {
  //typescript worker threads

  const makeTsBee = makeMakeJacsWorkerBee(mainProv) as unknown as MakeBee; //there is a different between dev/released version.

  //start

  startJaviTest({ makeTsBee, mainProv });
};

//no rejection handlers, because jago does that, and it always manages this script.

// type console, because this must be able to run in console.
mainWrapper("Dev.", main, "console", true, false);
