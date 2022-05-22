import { TestProvision } from "^jarun";

import { makeJacs_lazy } from "../_fixture";

import { install } from "^jacs";
import { BeeMain } from "^jabc";

//double install

export default (prov: TestProvision) => makeJacs_lazy(prov, __filename);

export const main: BeeMain = () => {
  (install as any)(); //this is second, because development compiler is already installed.
};
