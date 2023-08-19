import express from "express";
import expressWs from "express-ws";

import { Jsonable } from "^jab";
import { MainProv } from "^jab-node";
import { expressErrorsThrow } from "^jab-express";

export type Route = {
  path: string;
  makeHandler: () => express.Router;
};

type Deps = {
  staticWebFolder: string;
  clientConf?: {
    variable: string;
    value: Jsonable;
  };
  mainProv: MainProv;
  makeRoutes: Route[]; //routes must be created after we monkey patch. Therefore 'make'.
  indexHtml: string;
};

/**
 *
 * - server a static web folder at /
 * - deliver conf to client at /conf.js
 * - enable websocket in routers.
 * - enable history api fallback for reach router.
 *
 */
export const makeApp = (deps: Deps): express.Application => {
  //create

  const app = express();

  // activate websocket

  expressWs(app).getWss(); //do the monkey patching.

  // static files

  app.use("/", (express as any).static(deps.staticWebFolder));

  //dynamic configuration

  app.get("/conf.js", (req, res) => {
    res.set("Content-Type", "application/javascript; charset=UTF-8");
    if (deps.clientConf) {
      res.send(
        deps.clientConf.variable + " = " + JSON.stringify(deps.clientConf.value)
      );
    } else {
      res.send("");
    }
  });

  //routes

  for (const def of deps.makeRoutes) {
    app.use(def.path, def.makeHandler());
  }

  // history api fallback for react router.

  app.use("*", (req, res) => {
    // send index.html

    res.set("Content-Type", "text/html; charset=UTF-8");

    res.send(deps.indexHtml);
  });

  // error handler

  app.use(expressErrorsThrow);

  return app;
};
