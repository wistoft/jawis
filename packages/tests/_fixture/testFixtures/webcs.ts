import express from "express";

import { TestProvision } from "^jarun";
import { makeWebcs } from "^webcs/internal";

import { filterAbsoluteFilepath, getServer, getServerDeps } from "./index";

/**
 *
 */
export const getWebcsServer = (prov: TestProvision) => {
  const compileService = {
    load: (file: string) =>
      Promise.resolve("code for: " + filterAbsoluteFilepath(file)),
  };

  const mountPath = "webcs";

  const { makeRouter } = makeWebcs({
    port: 80,
    mountPath,
    staticWebFolder: "",
    compileService,
  });

  const app = express();

  app.use("/" + mountPath, makeRouter());

  return getServer(
    prov,
    getServerDeps(prov, undefined, {
      app,
    })
  );
};
