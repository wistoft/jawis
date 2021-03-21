import cors from "cors";
import express from "express";
import { err, JabError } from "^jab";

import { expressErrorsThrow, ServerAppRouter } from "^jab-express";

import { director, Deps as DirectorDeps } from "./director";

/**
 * jago/jates are nearly identically
 */
export const makeJagosRoute = (deps: DirectorDeps): ServerAppRouter => {
  const router = express.Router();

  // middleware

  router.use(cors()); // allow all cors

  // create app structure

  const { onWsUpgrade, onShutdown } = director(deps);

  // web socket

  router.ws("/ws", onWsUpgrade);

  // error handler

  router.use("*", expressErrorsThrow);

  return {
    router,
    onShutdown,
  };
};
