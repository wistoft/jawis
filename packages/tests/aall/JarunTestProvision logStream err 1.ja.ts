import { TestProvision } from "^jarun";

import { getJarunTestProvision } from "../_fixture";

export default (prov: TestProvision) => {
  const jtp = getJarunTestProvision(prov);

  jtp.logStream("stream", true as any);
};
