import { TestProvision } from "^jarun";

import { makeJacs_lazy } from "../_fixture";

import { uninstall } from "^jacs";

//double uninstall

export default (prov: TestProvision) => makeJacs_lazy(prov, __filename);

export const main = () => {
  uninstall();
  uninstall();
};
