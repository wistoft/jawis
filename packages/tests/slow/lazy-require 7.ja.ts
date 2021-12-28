import { TestProvision } from "^jarun";

import { makeJacs_lazy } from "../_fixture";
import * as ns from "express";

export default (prov: TestProvision) => makeJacs_lazy(prov, __filename);

// Use ns export (TypeScript adds __importStar)

export const main = () => {
  //no express
  console.log(Object.keys(require.cache).some((elm) => elm.includes("express"))); // prettier-ignore

  console.log(typeof ns.Router);
  console.log(typeof ns.Router());

  //now express is loaded.
  console.log(Object.keys(require.cache).some((elm) => elm.includes("express"))); // prettier-ignore
};
