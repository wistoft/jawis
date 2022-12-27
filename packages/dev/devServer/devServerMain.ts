import path from "path";

import { startJaviServer } from "^javi/util";
import { makeJaviDeps } from "^javi/makeJaviDeps";
import { MainProv, mainWrapper } from "^jab-node";

import conf from "../dev.conf";

const { getPackagePath, projectRoot } = require("../project.conf");

const main = (mainProv: MainProv) => {
  //default things

  const defaultThings = makeJaviDeps({ projectRoot });

  //start

  startJaviServer({
    ...conf,
    name: "Dev",
    mainProv,
    staticWebFolder: path.join(__dirname, "web"),
    clientConf: {
      projectRoot,
      removePathPrefix: "packages",
      initialShowSystemFrames: false,
      showClearLink: true,
    },

    jates: {
      absTestFolder: getPackagePath("dev/devServer/testsuite"),
      absTestLogFolder: getPackagePath("dev/devServer/testsuite/_testLogs"),
      tecTimeout: 20000,
      ...defaultThings.fileService,
    },

    jagos: {
      //needed, because dev WatchProcess, Jacs, etc. is used in the subprocesses.
      // so js-scripts can't be started without typescript support.
      alwaysTypeScript: true,
      scriptFolders: [getPackagePath("dev/devServer/scripts")],
      scripts: [
        {
          script: getPackagePath("dev/devServer/scripts/more/wannaBeServer.ts"),
          autoStart: false,
          autoRestart: true,
        },
      ],
      ...defaultThings.fileService,
    },

    makeRoutes: [],
  });
};

//no rejection handlers, because jago does that, and it always manages this script.

mainWrapper("Dev.", main, "jago", true, false);
