import { TestProvision } from "^jarun";
import { getBeeProv } from "^bee-node/bee-node";

import {
  getCommonJsProjectPath,
  getEsmProjectPath,
  getScriptPath,
  runLiveJacsBee_lazy,
} from "../_fixture/index";

export default (prov: TestProvision) => runLiveJacsBee_lazy(prov, __filename);

export const main = async () => {
  const beeProv = getBeeProv("testChannelToken", true);

  await beeProv.runBee({ filename: getScriptPath("hello.js") }, false);
  await beeProv.runBee(
    { filename: getEsmProjectPath("importJsFile.js") },
    false
  );
  await beeProv.runBee(
    { filename: getCommonJsProjectPath("importJsFile.js") },
    false
  );
};
