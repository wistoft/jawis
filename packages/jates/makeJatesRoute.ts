import cors from "cors";
import express from "express";

import { expressErrorsThrow } from "^jab-express";

import { director, DirectorDeps } from "./internal";

/**
 * jago/jates are nearly identically
 *
 * @tobe-deprecated Use the director which has been made independent of express.
 */
export const makeJatesRoute = (deps: DirectorDeps): express.Router => {
  const router = express.Router();

  //middleware

  router.use(cors()); // allow all cors

  // create app structure

  const { onWsUpgrade } = director(deps);

  // ws

  router.ws("/ws", onWsUpgrade);

  // error handler

  router.use("*", expressErrorsThrow);

  return router;
};
