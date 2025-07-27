import path from "node:path";
import { getDefaultServiceConf } from "^javi";
import { makeMakeRouter as makeDevAppRoute } from "^dev-apps";
import { makeMakeRouter as makeDevCompRoute } from "^dev-comps";
import { MainProv, makeAbsolute } from "^jab-node";
import {
  FullJaviConf,
  getFullConf,
  honeyCombService,
  makeCommandBee,
  makeFileServer,
  makeGoBee,
  makeJaviInnerDeps,
  makePowerBee,
  makeWebpackCompileService,
} from "^javi/internal";
import { makeBrowserBeeFrostPlugin } from "^jabro";
import { makeWebCsRoutePlugin } from "^webcs";
import { AbsoluteFile, FileService, SendLog } from "^jabc";
import { DevClientConf } from "^dev/devClient/DevDirector";
import { assertAbsolute } from "^jab-node";
import { makePhpBee } from "^bee-php";

import {
  getMakeMakeJacsWorkerBee,
  getReleasedConsoleCaptureMain,
} from "^dev/project.conf";
import {
  getPackagePath,
  projectRoot,
  serverPort,
  webpackPort,
  jagoConsolePortForDev,
} from "../project.conf";
import { getAbsoluteSourceFile_dev as getAbsoluteSourceFile } from "../util";

/**
 *
 */
export const makeDevDeps = async (
  sendLog: SendLog,
  mainProv: MainProv,
  extraConf: any = {},
  extraServiceConfig: any = {}
) => {
  //typescript worker threads

  const makeTsBee = getMakeMakeJacsWorkerBee()({
    ...mainProv,
    lazyRequire: false,
    cacheNodeResolve: true,
    module: "commonjs",
  }) as any;

  //synthetic config file

  const conf = getFullConf(
    {
      siteTitle: "Dev",
      port: serverPort,
      removePathPrefix: "packages",
      testFolder: getPackagePath("dev/devServer/testsuite"),
      testLogFolder: getPackagePath("dev/devServer/testsuite/_testLogs"),
      ...extraConf,
    },
    projectRoot,
    process.platform
  );

  //adding things to default service config

  const staticWebFolder = path.join(projectRoot);

  const defaultServiceConf = getDefaultServiceConf({
    conf,
    staticWebFolder,
    mainProv,
    sendLog,
  });

  const serviceConfig = {
    ...defaultServiceConf,
    "@jawis/development/getAbsoluteSourceFile": getAbsoluteSourceFile,

    "@jawis/javi/makeTsBee": { type: "service", make: () => makeTsBee },

    "@jawis/javi/plugins": [
      { name: "@jawis/javi/filesServer", make: makeFileServer },
      { name: "@jawis/webcs", make: makeWebCsRoutePlugin },
      { name: "@jawis/makeBrowserBee", make: makeBrowserBeeFrostPlugin },
    ],

    "@jawis/compileService": { type: "service", make: makeWebpackCompileService }, // prettier-ignore

    "@jawis/jates/tecTimeout": 6000,

    "@jawis/jagos/scriptFolders": [getPackagePath("dev/devServer/scripts")],
    "@jawis/jagos/scripts": [
      // {
      //   script: getPackagePath("dev/devServer/scripts/more/wannaBeServer.ts"),
      //   autoStart: false,
      //   autoRestart: true,
      // },
    ],

    "@jawis/javi/honeyComb": { type: "service", make: honeyCombService },

    "@jawis/javi/honeyComb/certainBees": {
      ts: "@jawis/javi/makeTsBee",
      ww: "@jawis/makeBrowserBee",
    },

    "@jawis/jate-rust/absTestFolder": makeAbsolute(projectRoot, "../xremap-dev"), // prettier-ignore

    // "@jawis/service-types": [javiJateRust],
    // "@jawis/service-types": [javiJateBehat, javiJatePhpUnit],

    "@jawis/javi/honeyComb/suffixBees": {
      ".ww.js": "@jawis/makeBrowserBee",
      ".ww.ts": "@jawis/makeBrowserBee",
      ".cmd": makeCommandBee,
      ".ps1": makePowerBee,
      ".php": makePhpBee,
      ".go": makeGoBee,
    },

    ...extraServiceConfig,
  };

  const extraClientConf: DevClientConf = {
    serverPort,
    jagoConsolePortForDev,
  };

  const defaultThings = await makeJaviInnerDeps({
    conf,
    serviceConfig,
    mainProv,
    staticWebFolder,

    webpackPort,
    extraClientConf,
    scripsToInclude: [assertAbsolute(getReleasedConsoleCaptureMain())],
  });

  //quick fix

  const fileService = await defaultThings.javiService.getService<FileService>(
    "@jawis/javi/fileService"
  );

  //done

  return {
    ...defaultThings,

    routes: [
      ...defaultThings.routes,
      {
        path: "/dev-comp",
        makeRouter: makeDevCompRoute({
          ...fileService,
          projectRoot,
          onError: mainProv.onError,
          finally: mainProv.finally,
          logProv: mainProv.logProv,
        }),
      },
      {
        path: "/default",
        makeRouter: makeDevAppRoute({
          onError: mainProv.onError,
          finally: mainProv.finally,
          logProv: mainProv.logProv,
        }),
      },
    ],
  };
};
