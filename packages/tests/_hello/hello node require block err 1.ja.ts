import { TestProvision } from "^jarun";

import { getStdinBlockProcess } from "../_fixture";

// sending no stdin to child. So it doesn't response to shutdown message.
export default (prov: TestProvision) => {
  const proc = getStdinBlockProcess(prov);
  return proc.shutdown();
};
