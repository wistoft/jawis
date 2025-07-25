import { BeeMain } from "^bee-common";
import { TestProvision } from "^jarun";

import { AbsoluteFile } from "^jabc";
import { runJacsBee_test } from "../_fixture/index";

//script throws

export default (prov: TestProvision) =>
  runJacsBee_test(prov, { def: { filename: __filename as AbsoluteFile } });

export const main: BeeMain = (beeProv) => {
  beeProv.registerErrorHandlers(beeProv.onError);
  throw new Error("hej");
};
