import { AbsoluteFile } from "^jab";
import { TestProvision } from "^jarun";

import { getBeeProv } from "../_fixture/index";

//run single bee, that don't exist

export default (prov: TestProvision) =>
  getBeeProv(prov).runBee({ filename: "dontExist" as AbsoluteFile }, false);
