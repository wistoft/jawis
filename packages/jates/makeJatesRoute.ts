import cors from "cors";
import express from "express";

import { expressErrorsThrow, ServerAppRouter } from "^jab-express";

import { director, Deps as DirectorDeps } from "./director";

/**
 * jago/jates are nearly identically
 */
export const makeJatesRoute = (deps: DirectorDeps): ServerAppRouter => {
  const router = express.Router();

  //middleware

  router.use(cors()); // allow all cors

  // create app structure

  const { onWsUpgrade } = director(deps);

  // ws

  router.ws("/ws", onWsUpgrade);

  // error handler

  router.use("*", expressErrorsThrow);

  return {
    router,
  };
};
