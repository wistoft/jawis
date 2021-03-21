import { jsExec } from "^jab-node";
import { TestProvision } from "^jarun";

import { getScriptPath } from "../_fixture";

export default (prov: TestProvision) => [jsExec(getScriptPath("hello.js"))];
//
