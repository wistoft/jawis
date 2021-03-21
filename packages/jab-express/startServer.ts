import { FinallyProvider } from "^jab";
import {
  mainWrapper,
  MainProv,
  flushAndExit,
  registerOnMessage,
  JabShutdownMessage,
} from "^jab-node";

import { ServerAppOld, ServerApp, MakeServerApp } from ".";

export type ServerDeps = {
  name: string;
  serverPort: number;
  makeApp: (prov: MainProv) => ServerApp;
};

/**
 *
 */
export const startServer = (deps: ServerDeps) => {
  mainWrapper(deps.name + ".", (mainProv) => {
    startServerAppMainOld(
      deps.makeApp(mainProv),
      deps.serverPort,
      mainProv.finalProv,
      () => console.log(deps.name + " port: " + deps.serverPort)
    );
  });
};

/**
 * Do the "main" part of serving an app.
 *
 * - starts the web server.
 * - listens to shutdown.
 * - run finally after app have finished shutdown.
 * - setup rejection handlers.
 */
export const startServerAppMain = (
  logPrefix: string,
  makeServerApp: MakeServerApp,
  port: number,
  callback?: () => void
) => {
  mainWrapper(logPrefix, (mainProv) => {
    const { app, onShutdown } = makeServerApp(mainProv);

    // message from jago

    registerOnMessage((msg: JabShutdownMessage) => {
      if (msg.type === "shutdown") {
        Promise.resolve()
          .then(() => onShutdown && onShutdown())
          .then(mainProv.finalProv.runFinally)
          .finally(flushAndExit);
      }
    });

    // start server

    app.listen(port, callback);
  });
};

/**
 *
 */
export const startServerAppMainOld = (
  serverApp: ServerAppOld,
  port: number,
  finalProv: FinallyProvider,
  callback?: () => void
) => {
  // the app

  const {
    app: expressApp,
    onUncaughtException,
    onUnhandledPromiseRejection,
    onShutdown,
  } = serverApp;

  // error handlers

  if (onUncaughtException) {
    process.on("uncaughtException", onUncaughtException);
  }

  if (onUnhandledPromiseRejection) {
    process.on("unhandledRejection", onUnhandledPromiseRejection);
  }

  // message from jago

  if (onShutdown) {
    registerOnMessage((msg: JabShutdownMessage) => {
      if (msg.type === "shutdown") {
        // More robust to do a timeout race here.
        onShutdown().then(() => process.exit());
      }
    });
  }

  // start server

  expressApp.listen(port, callback);
};
