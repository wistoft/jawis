//javi always import released version, but dev wants to choose:

// import released versions for `devServerMain.ts`

// eslint-disable-next-line import/no-extraneous-dependencies
import { makeMakeJacsWorkerBee } from "@wistoft/jacs";

//import development versions for `devServerMain.ts`

import { makeTsNodeJabProcess } from "^jawis-util/node";
import { createDefaultTestRunners } from "^jarun";
import { makeJatesRoute } from "^jates";
import { makeJagosRoute } from "^jagos";
import { createApp, Route, startServer } from "^jab-express";
import { Deps as JatesDeps } from "^jates/director";
import { Deps as JagosDeps } from "^jagos/director";
import { MakeBee, MakeJabProcess } from "^jab-node";

import { JaviClientConf } from "../client";

export type Deps = {
  name: string;
  serverPort: number;
  staticWebFolder: string;
  clientConf: JaviClientConf;
  jates: Partial<JatesDeps> & Pick<JatesDeps, "absTestFolder" | "absTestLogFolder">; // prettier-ignore
  jago: Partial<JagosDeps> & Pick<JagosDeps, "scriptFolders" | "scripts">; // prettier-ignore
  makeRoutes?: Route[];
};

/**
 *
 */
export const startJaviServer = (deps: Deps) => {
  startServer({
    name: deps.name,
    serverPort: deps.serverPort,

    makeApp: (mainProv) => {
      const { onError, finalProv, logProv } = mainProv;

      //compile service

      const makeJacsBee = (makeMakeJacsWorkerBee(
        mainProv
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
            ...deps.jago,
          }),
      };

      //app

      return createApp({
        staticWebFolder: deps.staticWebFolder,
        mainProv,
        makeRoutes: [jates, jagos, ...(deps.makeRoutes || [])],
        clientConf: {
          variable: "__JAVI_CLIENT_CONF",
          value: deps.clientConf,
        },
      });
    },
  });
};
