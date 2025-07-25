#!/usr/bin/env node

import { mainWrapper } from "^main-wrapper";
import { MainProv } from "^jab-node";

import { makeJaviDeps, startJaviServer } from "./internal";

mainWrapper({
  logPrefix: "Javi.",
  main: async (mainProv: MainProv) => startJaviServer(await makeJaviDeps(mainProv)), // prettier-ignore
  enableLongTraces: false, //not needed in production
});
