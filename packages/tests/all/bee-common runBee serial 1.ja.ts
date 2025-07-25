import { AbsoluteFile } from "^jab";
import { TestProvision } from "^jarun";

import { getBeeProv } from "../_fixture/index";

//run two bees, both sync

export default (prov: TestProvision) =>
  getBeeProv(prov).runBee(
    {
      filename: "helloModule" as AbsoluteFile,
      next: { filename: "echoModule" as AbsoluteFile, data: "fido" },
    },
    false
  );
