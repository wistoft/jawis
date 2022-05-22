import { TestProvision } from "^jarun";

import { makeJacs_lazy } from "../_fixture";

import fs from "fs";
import { BeeMain } from "^jabc";

// Use exported native-default-function.

export default (prov: TestProvision) => makeJacs_lazy(prov, __filename);

export const main: BeeMain = () => {
  console.log(typeof fs);
  console.log(fs.existsSync("asdfljk"));
};
