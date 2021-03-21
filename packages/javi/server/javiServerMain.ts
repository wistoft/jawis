#!/usr/bin/env node
import path from "path";
import { startJaviServer } from "^javi/server/util";

import { getJaviConf } from "./getConf";

//conf

const conf = getJaviConf(process.cwd());

//start

startJaviServer({
  name: "Javi",
  serverPort: conf.port,
  staticWebFolder: path.join(__dirname, "../client/compiled"),
  clientConf: {
    projectRoot: conf.projectRoot,
    removePathPrefix: conf.removePathPrefix,
    initialShowSystemFrames: conf.initialShowSystemFrames,
    showClearLink: conf.showClearLink,
  },

  jates: {
    absTestFolder: conf.absTestFolder,
    absTestLogFolder: conf.absTestLogFolder,
  },

  jago: {
    scriptFolders: conf.scriptFolders,
    scripts: conf.scripts,
  },
});
