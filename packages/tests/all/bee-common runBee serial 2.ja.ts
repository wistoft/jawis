import { AbsoluteFile } from "^jab";
import { TestProvision } from "^jarun";

import { getBeeProv } from "../_fixture/index";

//second bee waits for async module

export default (prov: TestProvision) =>
  getBeeProv(prov).runBee(
    {
      filename: "asyncModule" as AbsoluteFile,
      next: { filename: "helloModule" as AbsoluteFile },
    },
    false
  );
