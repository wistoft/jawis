import { AbsoluteFile } from "^jab";
import { TestProvision } from "^jarun";

import { getBeeProv } from "../_fixture/index";

//error in first cancels the bee chain.

export default (prov: TestProvision) =>
  getBeeProv(prov).runBee(
    {
      filename: "dontExist" as AbsoluteFile,
      next: { filename: "helloModule" as AbsoluteFile },
    },
    false
  );
