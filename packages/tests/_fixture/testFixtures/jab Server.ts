import express, { Application } from "express";
import expressWs from "express-ws";

import { ServerDeps, ServerWaiter } from "^jab-node";
import { TestProvision } from "^jarun";

import { getDefaultServerConf } from ".";

/**
 *
 */
export const getServer = (prov: TestProvision, serverDeps: ServerDeps) => {
  const server = new ServerWaiter(serverDeps);

  prov.finally(server.killIfRunning);

  return server.waitForListening().then(() => server);
};

/**
 *
 */
export const getServer_chatty = (
  prov: TestProvision,
  logPrefix = "",
  extraDeps: Partial<ServerDeps> & {
    app: Application;
  }
) => {
  const server = new ServerWaiter(getServerDeps(prov, logPrefix, extraDeps));

  prov.finally(server.killIfRunning);

  return server.waitForListening().then(() => server);
};

/**
 *
 */
export const getServer_test_app = (
  prov: TestProvision,
  logPrefix = "",
  extraDeps?: Partial<ServerDeps>
) => {
  const server = new ServerWaiter(
    getServerDeps(prov, logPrefix, { ...extraDeps, app: getTestApp(prov) })
  );

  prov.finally(server.killIfRunning);

  return server.waitForListening().then(() => server);
};

/**
 *
 */
export const getServerDeps_test_app = (
  prov: TestProvision,
  logPrefix = "",
  extraDeps?: Partial<ServerDeps>
): ServerDeps =>
  getServerDeps(prov, logPrefix, {
    ...extraDeps,
    app: getTestApp(prov),
  });

/**
 *
 */
export const getServerDeps = (
  prov: TestProvision,
  logPrefix = "",
  extraDeps: Partial<ServerDeps> & {
    app: Application;
  }
): ServerDeps => ({
  port: getDefaultServerConf().port,

  log: (msg: string) => {
    prov.log(logPrefix + "server.log", msg);
  },
  onError: prov.onError,
  onOpen: () => {
    prov.log(logPrefix + "server", "open");
  },
  onClose: () => {
    prov.log(logPrefix + "server", "close");
  },
  ...extraDeps,
});

/**
 *
 */
export const getTestApp = (prov: TestProvision) => {
  const realApp = express();

  const wsInstance = expressWs(realApp);
  const app = wsInstance.app;

  // front page

  app.get("/", (req, res) => {
    res.end("hello from test server");
  });

  // web socket

  app.ws("/ws", (ws) => {
    ws.on("message", () => {
      ws.send(JSON.stringify("hello from test socket"));
    });
  });

  // global error handler

  app.use((err: any, req: any, res: any, _next: any) => {
    console.log("Server: " + err);

    res.end("error");
  });

  return realApp;
};
