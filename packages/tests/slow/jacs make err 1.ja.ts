import { TestProvision } from "^jarun";

import { makeJacs_lazy } from "../_fixture";

//script throws

export default (prov: TestProvision) => makeJacs_lazy(prov, __filename);

export const main = () => {
  throw new Error("hej");
};
