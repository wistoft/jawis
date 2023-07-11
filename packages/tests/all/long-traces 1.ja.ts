import async_hooks from "async_hooks";

import { unknownToErrorData } from "^jab";
import { enable } from "^long-traces";

import {
  filterStackTrace,
  runLiveJacsBee,
} from "../_fixture/testFixtures/diverse jacs compile";

//single nested setTimeout

export default (prov: any) => runLiveJacsBee(prov, __filename);

//hacky way to detect if in test process or in sub bee.
if (module.parent?.parent === null) {
  enable(async_hooks);

  setTimeout(() => {
    console.log(filterStackTrace(unknownToErrorData(new Error())));
  }, 0);
}
