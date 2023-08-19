#!/usr/bin/env node
import { mainWrapper } from "^main-wrapper";
import { MainProv } from "^jab-node";
import { makeMakeJacsWorkerBee } from "^jacs";

import { startJaviTest } from "./internal";

const main = (mainProv: MainProv) => {
  //typescript worker threads

  const makeTsBee = makeMakeJacsWorkerBee(mainProv);

  //start

  startJaviTest({ makeTsBee, mainProv });
};

mainWrapper("Javi.", main, "console", true);
