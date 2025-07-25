import fs from "node:fs";
import path from "node:path";
import express from "express";
import expressWs from "express-ws";

import { Jsonable, err } from "^jab";
import { expressErrorsThrow } from "^jab-express";

//must be a function, because
// routes must be created after we monkey patch for web socket.
export type DeferredRoute = {
  path: string;
  makeRouter: () => Promise<express.Router> | express.Router;
};

type Deps = {
  staticWebFolder: string;
  routes: DeferredRoute[];
  clientConf: {
    variable: string;
    value: Jsonable;
  };
  indexHtml: string;
};

/**
 *
 * - Deliver a static web folder at /
 * - Deliver conf to client at /conf.js
 * - Enable websocket in routers.
 * - Enable history api fallback for reach router.
 *
 */
export const makeApp = async (deps: Deps): Promise<express.Application> => {
  //create

  const app = express();

  // activate websocket

  expressWs(app as any); //do the monkey patching.

  // static files

  app.use("/", (express as any).static(deps.staticWebFolder));

  //dynamic configuration

  app.get("/conf.js", (req, res) => {
    res.set("Content-Type", "application/javascript; charset=UTF-8");
    if (deps.clientConf) {
      res.send(
        deps.clientConf.variable +
          " = " +
          JSON.stringify(deps.clientConf.value, null, 2)
      );
    } else {
      res.send("");
    }
  });

  //routes

  for (const def of deps.routes) {
    app.use(def.path, await def.makeRouter());
  }

  // history api fallback for react router.

  app.use("*", (req, res) => {
    // error message for web sockets

    if (req.headers.upgrade) {
      err("No web socket handler for this URL: " + req.originalUrl);
    }

    // send index.html

    res.set("Content-Type", "text/html; charset=UTF-8");

    res.send(deps.indexHtml);
  });

  // error handler

  app.use(expressErrorsThrow);

  return app;
};
