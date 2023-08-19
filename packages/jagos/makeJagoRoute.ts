import cors from "cors";
import express from "express";

import { expressErrorsThrow } from "^jab-express";

import { director, DirectorDeps } from "./internal";

/**
 * jago/jates are nearly identically
 */
export const makeJagosRoute = (deps: DirectorDeps): express.Router => {
  const router = express.Router();

  // middleware

  router.use(cors()); // allow all cors

  // create app structure

  const { onWsUpgrade } = director(deps);

  // web socket

  (router as any).ws("/ws", onWsUpgrade as any);

  // error handler

  router.use("*", expressErrorsThrow);

  return router;
};
