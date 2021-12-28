import path from "path";

// import released versions for `devServerMain.ts`

// eslint-disable-next-line import/no-extraneous-dependencies
import { makeMakeJacsWorkerBee } from "^released/jacs";

import { startJaviServer } from "^javi";
import { makeDevAppRoute } from "^dev-apps";
import { MainProv, mainWrapper } from "^jab-node";

import conf from "../dev.conf";
import { koa } from "./hello-koa";

const { getPackagePath, projectRoot } = require("../../../project.conf");

const main = (mainProv: MainProv) => {
  startJaviServer({
    ...conf,
    name: "Dev",
    mainProv,
    staticWebFolder: path.join(__dirname, "web"),
    projectRoot,
    makeMakeJacsWorkerBee: makeMakeJacsWorkerBee as any,
    vsCodeBinary: "C:\\Program Files\\Microsoft VS Code\\Code.exe",
    winMergeBinary: "C:\\Program Files (x86)\\WinMerge\\WinMergeU.exe",
    clientConf: {
      projectRoot,
      removePathPrefix: "packages",
      initialShowSystemFrames: false,
      showClearLink: true,
    },

    testFrameworkDef: {
      jarun: true,
      absJarunTestFolders: [
        getPackagePath("dev/devServer/testsuite"),
        path.join(projectRoot, "sharp/PrimeService.Tests"),
      ],
      absMochaTestFolder: getPackagePath("dev/devServer/tests-mocha"),
      absJestTestFolder: getPackagePath("dev/devServer/tests-jest"),
    },

    jates: {
      absTestLogFolder: getPackagePath("dev/devServer/testsuite/_testLogs"),
      tecTimeout: 20000,
    },

    jagos: {
      //needed, because dev WatchProcess, Jacs, etc. is used in the subprocesses.
      // so js-scripts can't be started without typescript support.
      alwaysTypeScript: true,
      projectRoot,
      scriptFolders: [getPackagePath("dev/devServer/scripts")],
      scripts: [
        {
          script: getPackagePath("dev/devServer/scripts/more/wannaBeServer.ts"),
          autoStart: false,
          autoRestart: true,
        },
      ],
    },

    makeRoutes: [
      {
        type: "serverApp",
        path: "/default",
        makeHandler: ({ mainProv, wsServer }) =>
          makeDevAppRoute({
            wsServer,
            onError: mainProv.onError,
            finally: mainProv.finally,
            logProv: mainProv.logProv,
          }),
      },
      {
        type: "express",
        path: "/koa",
        makeHandler: () => koa.callback() as any,
      },
    ],
  });
};

//no rejection handlers, because jago does that, and it always manages this script.

mainWrapper({
  main,
  type: "jago",
  registerOnShutdown: true,
  doRegisterErrorHandlers: false,
  enableLongTraces: true,
});
