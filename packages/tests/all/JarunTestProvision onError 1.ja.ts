import { JabError } from "^jab";
import { TestProvision } from "^jarun";

import { filterTestLogs, getJarunTestProvision } from "../_fixture";

export default (prov: TestProvision) => {
  const jtp = getJarunTestProvision(prov);

  jtp.onError(new Error("ups"), [{ arg: [] }]);
  jtp.onError(new JabError("ups", []), [undefined]);
  jtp.onError(new JabError("ups", undefined));

  return filterTestLogs(jtp.logs);
};
