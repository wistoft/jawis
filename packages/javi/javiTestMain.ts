#!/usr/bin/env node

import { mainWrapper } from "^main-wrapper";
import { MainProv } from "^jab-node";

import { makeJaviDeps, startJaviTest } from "./internal";

mainWrapper({
  logPrefix: "Javi.",
  main: async (mainProv: MainProv) => startJaviTest(await makeJaviDeps(mainProv)), // prettier-ignore
  enableLongTraces: false, //not needed in production
});
