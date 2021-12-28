#!/usr/bin/env node
import path from "path";

import { MainProv, mainWrapper } from "^jab-node";
import { makeMakeJacsWorkerBee } from "^jacs";

import { startJaviServer } from "./javi-start";
import { getJaviConf } from "./getConf";

const main = (mainProv: MainProv) => {
  //conf

  const conf = getJaviConf(process.cwd());

  //start

  startJaviServer({
    name: conf.siteTitle,
    mainProv,
    serverPort: conf.port,
    staticWebFolder: path.join(__dirname, "client"),
    makeMakeJacsWorkerBee,
    clientConf: {
      siteTitle: conf.siteTitle,
      projectRoot: conf.projectRoot,
      removePathPrefix: conf.removePathPrefix,
      initialShowSystemFrames: conf.initialShowSystemFrames,
      showClearLink: conf.showClearLink,
    },

    //todo: get from config file.
    testFrameworkDef: {
      jarun: true,
      absJarunTestFolders: [conf.absTestFolder],
    },

    jates: {
      absTestLogFolder: conf.absTestLogFolder,
      tecTimeout: conf.tecTimeout,
    },

    jagos: {
      projectRoot: conf.projectRoot,
      scriptFolders: conf.scriptFolders,
      scripts: conf.scripts,
    },
    ...conf,
  });
};

mainWrapper({
  logPrefix: "Javi.",
  main,
  type: "console",
  registerOnShutdown: true,
  enableLongTraces: false, //not needed in production
});
