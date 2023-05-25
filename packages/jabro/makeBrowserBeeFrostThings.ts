import { MainProv } from "^jab-node";

import { makeBrowserBeeFrost } from "./internal";

type Deps = {
  mainProv: MainProv;
};

/**
 * quick fix
 */
export const makeBrowserBeeFrostThings = (deps: Deps) => {
  //todo: make a route to serve scripts, so this isn't hardcoded to www folder.
  const scriptsUrl = "http://localhost:3001/";

  return makeBrowserBeeFrost({
    scriptsUrl,
    ...deps.mainProv,
  });
};
