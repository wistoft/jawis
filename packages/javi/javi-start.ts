import {
  makeCompareFiles,
  FileService,
  makeHandleOpenFileInVsCode,
  makeTsNodeJabProcess,
  makeWebcsRoute,
  WebpackCompileService,
} from "^util-javi/node";

import { makeJatesRoute } from "^jates";
import { makeJagosRoute } from "^jagos";
import { makeApp, Route } from "^jab-express";
import { Deps as JatesDeps } from "^jates/director";
import { Deps as JagosDeps } from "^jagos/director";
import { getUrlToRequire, MainProv } from "^jab-node";

import { JaviClientConf } from "./types";

import { MakeBee } from "^jab";
import {
  makeMakeTestFramework as makeMakeComposedTestFramework,
  makeMakeJarunTestRunners,
} from "./javi-test";
import { makeHoneyComb } from "./javi-compile";
import { MakeMakeJacsBeeDeps } from "^jacs";

export type TestFrameworkDefinition = {
  jarun?: boolean; //quick fix
  absJarunTestFolders: string[];
  absMochaTestFolder?: string;
  absJestTestFolder?: string;
};

export type Deps = {
  name: string;
  mainProv: MainProv;
  serverPort: number;
  staticWebFolder: string;
  projectRoot: string;
  clientConf: JaviClientConf;
  testFrameworkDef: TestFrameworkDefinition;
  jates: Partial<JatesDeps> & Pick<JatesDeps, "absTestLogFolder" | "tecTimeout">; // prettier-ignore
  jagos: Partial<JagosDeps> & Pick<JagosDeps, "scriptFolders" | "scripts" | "projectRoot">; // prettier-ignore
  makeRoutes?: Route[];
  makeMakeJacsWorkerBee: (deps: MakeMakeJacsBeeDeps) => MakeBee;
  vsCodeBinary: string;
  winMergeBinary: string;
  sshConfig?: any;
};

/**
 * - Configure routes for jates and jagos.
 * - Add additional routes, defined in deps.
 * - Start web server
 *
 * note
 *  - this caters for both production and dev sites. (to avoid code duplication.)
 */
export const startJaviServer = (deps: Deps) => {
  const { onError, finalProv, logProv } = deps.mainProv;

  //compile service

  const cacheNodeResolve = true; //todo: extract
  const lazyRequire = true; //todo: extract

  const makeJacsBee = deps.makeMakeJacsWorkerBee({
    ...deps.mainProv,
    cacheNodeResolve,
    lazyRequire,
  });

  //honeyComb for making bees.

  const webcsUrl = "http://localhost:" + deps.serverPort + "/webcs/";
  const webRootUrl = "http://localhost:" + deps.serverPort;
  const compileServiceRoot = deps.projectRoot;

  const sshDeps = deps.sshConfig && {
    onError,
    finally: finalProv.finally,
    logProv,
    sshConfig: deps.sshConfig,
  };

  const { honeyComb, browserBeeFrost } = makeHoneyComb({
    compileServiceRoot,
    webcsUrl,
    ymerUrl: getUrlToRequire({
      staticWebFolder: deps.staticWebFolder,
      webRootUrl,
      liveFilepath: "/ymer.js", //for production, it's compiled and place in web root
      webcsUrl,
      devFilepath: "packages/jagov/ymer.ts", //placed here in development.
    }),
    sshDeps,
  });

  //file service

  const fileService: FileService = {
    handleOpenFileInEditor: makeHandleOpenFileInVsCode(deps.vsCodeBinary),
    compareFiles: makeCompareFiles(deps.winMergeBinary),
  };

  //jates

  const makeTestFramework = makeMakeComposedTestFramework({
    ...deps.jates,
    testFrameworkDef: deps.testFrameworkDef,
    makeJarunTestRunners: makeMakeJarunTestRunners({
      honeyComb,
      makeTsBee: makeJacsBee,
      makeTsProcess: makeTsNodeJabProcess,
      makeBrowserBee: (deps) => honeyComb.makeCertainBee("ww", deps),
      compileServiceRoot,
      staticWebFolder: deps.staticWebFolder,
      webRootUrl,
      webcsUrl,
    }),
  });

  const jates: Route = {
    type: "serverApp",
    path: "/jate",
    makeHandler: () =>
      makeJatesRoute({
        makeTestFramework,
        onError,
        finally: finalProv.finally,
        logProv,
        absTestFolder: deps.testFrameworkDef.absJarunTestFolders[0], // quick fix
        ...fileService,
        ...deps.jates,
      }),
  };

  //jagos

  const jagos: Route = {
    type: "serverApp",
    path: "/jago",
    makeHandler: () =>
      makeJagosRoute({
        makeTsBee: makeJacsBee,
        honeyComb,
        browserBeeFrost,
        onError,
        finally: finalProv.finally,
        logProv,
        ...fileService,
        ...deps.jagos,
      }),
  };

  //webcs

  const webcs: Route = {
    type: "serverApp",
    path: "/webcs",
    makeHandler: () =>
      makeWebcsRoute({
        compileService: new WebpackCompileService({
          projectRoot: deps.projectRoot,
          onError,
        }),
      }),
  };

  //app

  const app = makeApp({
    staticWebFolder: deps.staticWebFolder,
    mainProv: deps.mainProv,
    makeRoutes: [jates, jagos, webcs, ...(deps.makeRoutes || [])],
    clientConf: {
      variable: "__JAVI_CLIENT_CONF",
      value: deps.clientConf,
    },
  });

  // start server

  app.listen(deps.serverPort, () =>
    deps.mainProv.log(deps.name + " port: " + deps.serverPort)
  );
};
