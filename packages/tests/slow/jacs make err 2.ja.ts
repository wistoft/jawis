import { TestProvision } from "^jarun";

import { getWorkerData, makeJacs_lazy } from "../_fixture";

import { install } from "^jacs";

//double install

export default (prov: TestProvision) => makeJacs_lazy(prov, __filename);

export const main = () => {
  install(getWorkerData()); //this is second, because development compiler is already installed.
};
