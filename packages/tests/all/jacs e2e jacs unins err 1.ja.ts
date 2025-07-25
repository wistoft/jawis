import { TestProvision } from "^jarun";

import { AbsoluteFile } from "^jabc";
import { uninstall } from "^jacs";
import { runJacsBee_test } from "../_fixture";

//double uninstall

export default (prov: TestProvision) =>
  runJacsBee_test(prov, { def: { filename: __filename as AbsoluteFile } });

export const main = () => {
  uninstall();
  uninstall();
};
