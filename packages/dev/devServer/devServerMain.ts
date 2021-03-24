import path from "path";

import { getPackagePath, projectRoot } from "^config/project.conf";
import { startJaviServer } from "^javi/server/util";
import { makeDefaultRoute } from "^default-api";

import devApp from "../helloExpress/helloExpress";

import conf from "../dev.conf";
import { MainProv, mainWrapper } from "^jab-node";

const main = (mainProv: MainProv) => {
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
    },

    jago: {
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
    },

    makeRoutes: [
      {
        type: "express",
        path: "/helloExpress/",
        makeHandler: () => devApp,
      },
      {
        type: "serverApp",
        path: "/default",
        makeHandler: ({ mainProv, wsServer }) =>
          makeDefaultRoute({
            wsServer,
            onError: mainProv.onError,
            finally: mainProv.finally,
            logProv: mainProv.logProv,
          }),
      },
    ],
  });
};

mainWrapper("Dev.", main, "console", true);
