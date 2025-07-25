import { AbsoluteFile } from "^jab";
import { TestProvision } from "^jarun";

import { getBeeProv } from "../_fixture/index";

//run single bee, and wait for it

export default (prov: TestProvision) =>
  getBeeProv(prov).runBee({ filename: "asyncModule" as AbsoluteFile }, false);
