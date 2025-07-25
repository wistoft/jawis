import { makeMakeGeneralRouter } from "^jab-express";

import { DirectorDeps, director } from "./internal";

/**
 *
 */
export const makeMakeRouter = (deps: DirectorDeps) =>
  makeMakeGeneralRouter(director(deps));
