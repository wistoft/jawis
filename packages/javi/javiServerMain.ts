#!/usr/bin/env node
import path from "path";

import { MainProv, mainWrapper } from "^jab-node";

import { startJaviServer } from "./util";
import { getJaviConf } from "./getConf";

/**
 *
 */
const main = (mainProv: MainProv) => {
  //conf

  const conf = getJaviConf(process.cwd());

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
    },

    jagos: {
      projectRoot: conf.projectRoot,
      scriptFolders: conf.scriptFolders,
      scripts: conf.scripts,
    },
  });
};

mainWrapper("Javi.", main, "console", true);
