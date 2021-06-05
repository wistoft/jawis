//javi always import released version, but dev wants to choose:

// import released versions for `devServerMain.ts`

// eslint-disable-next-line import/no-extraneous-dependencies
import { makeMakeJacsWorkerBee } from "@jawis/jacs";

//import development versions for `devServerMain.ts`

import { makeTsNodeJabProcess } from "^util-javi/node";
import { createDefaultTestRunners } from "^jarun";
import { makeJatesRoute } from "^jates";
import { makeJagosRoute } from "^jagos";
import { makeApp, Route } from "^jab-express";
import { Deps as JatesDeps } from "^jates/director";
import { Deps as JagosDeps } from "^jagos/director";
import { MainProv, MakeBee } from "^jab-node";

import { JaviClientConf } from "./types";

export type Deps = {
  name: string;
  mainProv: MainProv;
  serverPort: number;
  staticWebFolder: string;
  clientConf: JaviClientConf;
  jates: Partial<JatesDeps> & Pick<JatesDeps, "absTestFolder" | "absTestLogFolder" | "tecTimeout">; // prettier-ignore
  jagos: Partial<JagosDeps> & Pick<JagosDeps, "scriptFolders" | "scripts" | "projectRoot">; // prettier-ignore
  makeRoutes?: Route[];
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

  const makeJacsBee = (makeMakeJacsWorkerBee(
    deps.mainProv
  ) as unknown) as MakeBee; //bug for development: there is a different between dev/released version.

  //jates

  const jates: Route = {
    type: "serverApp",
    path: "/jate",
    makeHandler: () =>
      makeJatesRoute({
        createTestRunners: createDefaultTestRunners,
        makeTsProcess: makeTsNodeJabProcess,
        makeTsBee: makeJacsBee,
        onError,
        finally: finalProv.finally,
        logProv,
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
        onError,
        finally: finalProv.finally,
        logProv,
        ...deps.jagos,
      }),
  };

  //app

  const app = makeApp({
    staticWebFolder: deps.staticWebFolder,
    mainProv: deps.mainProv,
    makeRoutes: [jates, jagos, ...(deps.makeRoutes || [])],
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
