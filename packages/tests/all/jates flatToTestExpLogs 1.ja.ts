import { TestProvision } from "^jarun";

import { flatToTestExpLogs_compat } from "^jatec";
import { errorData1 } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(flatToTestExpLogs_compat({}));
  imp(flatToTestExpLogs_compat({ imp: ["dav"] }));
  imp(flatToTestExpLogs_compat({ return: ["dav"] }));
  imp(flatToTestExpLogs_compat({ err: [errorData1 as any] }));
};
