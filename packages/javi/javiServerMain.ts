#!/usr/bin/env node
import path from "path";

import { MainProv, mainWrapper } from "^jab-node";
import { makeMakeJacsWorkerBee } from "^jacs";

import { startJaviServer, getJaviConf, makeJaviDeps } from "./internal";

/**
 *
 */
const main = (mainProv: MainProv) => {
  //conf

  const conf = getJaviConf(process.cwd());

  //typescript worker threads

  const makeTsBee = makeMakeJacsWorkerBee(mainProv);

  //default things

  const defaultThings = makeJaviDeps(conf);

  //start

  startJaviServer({
    name: "Javi",
    mainProv,
    serverPort: conf.port,
    staticWebFolder: path.join(__dirname, "client"),
    clientConf: {
      projectRoot: conf.projectRoot,
      removePathPrefix: conf.removePathPrefix,
      initialShowSystemFrames: conf.initialShowSystemFrames,
      showClearLink: conf.showClearLink,
    },

    jates: {
      absTestFolder: conf.absTestFolder,
      absTestLogFolder: conf.absTestLogFolder,
      tecTimeout: conf.tecTimeout,
      makeTsBee,
      ...defaultThings.fileService,
    },

    jagos: {
      scriptFolders: conf.scriptFolders,
      scripts: conf.scripts,
      makeTsBee,
      ...defaultThings.fileService,
    },
  });
};

mainWrapper("Javi.", main, "console", true);
