import { execBee } from "^jab";
import { makePlainProcessBee } from "^jab-node";
import { TestProvision } from "^jarun";

import { getScriptPath } from "../_fixture";

export default (prov: TestProvision) =>
  execBee({
    def: { filename: getScriptPath("hello.js") },
    finallyFunc: prov.finally,
    makeBee: makePlainProcessBee,
  }).promise;
