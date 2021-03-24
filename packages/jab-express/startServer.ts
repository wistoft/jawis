import type express from "express";
import { MainProv, mainWrapper } from "^jab-node";
import { err } from "^jab/error";

type ServerApp = {
  app: express.Application;
  onShutdown?: () => Promise<void>;
};

export type ServerDeps = {
  name: string;
  serverPort: number;
  makeApp: (prov: MainProv) => ServerApp;
};

/**
 * ubrugt
 *
 * Serve an express app.
 *
 * - start the web server.
 * - register to onShutdown from the routes.
 */
export const startServer = (deps: ServerDeps) => {
  mainWrapper(
    deps.name + ".",
    (mainProv) => {
      const { app, onShutdown } = deps.makeApp(mainProv);

      if (onShutdown) {
        err("not used anymore", onShutdown);
      }

      // start server

      app.listen(deps.serverPort, () =>
        mainProv.log(deps.name + " port: " + deps.serverPort)
      );
    },
    "console",
    true
  );
};
