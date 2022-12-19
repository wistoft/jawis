import { makeJabError } from "^jab";
import { TestProvision } from "^jarun";

import { filterTestLogs, getJarunTestProvision } from "../_fixture";

export default (prov: TestProvision) => {
  const jtp = getJarunTestProvision(prov);

  jtp.onError(new Error("ups"), [{ arg: [] }]);
  jtp.onError(makeJabError("ups", []), [undefined]);
  jtp.onError(makeJabError("ups", undefined));

  return filterTestLogs(jtp.logs);
};
