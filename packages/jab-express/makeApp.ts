import { Express } from "express-serve-static-core";
import express from "express";
import expressWs from "express-ws";
import WebSocket from "ws";

import path from "path";

import { expressErrorsThrow, ServerAppRouter } from ".";

import { assertNever, Json } from "^jab";
import { MainProv } from "^jab-node";
import { err } from "^jab/error";

export type RouteDeps = {
  mainProv: MainProv;
  wsServer: WebSocket.Server;
};

export type Route =
  | {
      type: "serverApp";
      path: string;
      makeHandler: (deps: RouteDeps) => ServerAppRouter;
    }
  | {
      type: "express";
      path: string;
      makeHandler: (deps: RouteDeps) => Express;
    };

export type DevAppDeps = {
  staticWebFolder: string;
  clientConf?: {
    variable: string;
    value: Json;
  };
  mainProv: MainProv;
  makeRoutes: Route[]; //routes must be created after we monkey patch. Therefore 'make'.
};

/**
 *
 * - server a static web folder at /
 * - deliver conf to client at /conf.js
 * - enable websocket in routers.
 * - enable history api fallback for reach router.
 *
 */
export const makeApp = (deps: DevAppDeps): express.Application => {
  const showdownHandlers: (() => Promise<void>)[] = [];

  //create

  const app = express();

  // activate websocket

  const wsServer = expressWs(app).getWss(); //do the monkey patching.

  // static files

  app.use("/", express.static(deps.staticWebFolder));

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
    switch (def.type) {
      case "serverApp": {
        const handler = def.makeHandler({ mainProv: deps.mainProv, wsServer });

        app.use(def.path, handler.router);

        if (handler.onShutdown) {
          showdownHandlers.push(handler.onShutdown);
        }
        continue;
      }

      case "express":
        app.use(
          def.path,
          def.makeHandler({ mainProv: deps.mainProv, wsServer })
        );
        continue;

      default:
        throw assertNever(def);
    }
  }

  // history api fallback for react router.

  app.use("*", (req, res) => {
    res.sendFile(path.join(deps.staticWebFolder, "index.html"));
  });

  // error handler

  app.use(expressErrorsThrow);

  // compose onShutdown

  if (showdownHandlers.length !== 0) {
    err("not used anymore, showdown handlers: ", showdownHandlers.length);
  }

  return app;
};
