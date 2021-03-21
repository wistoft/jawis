import { TestProvision } from "^jarun";

import { errorData1 } from "../_fixture";
import { flatToTestExpLogs_compat } from "^jatec";

export default ({ imp }: TestProvision) => {
  imp(flatToTestExpLogs_compat({}));
  imp(flatToTestExpLogs_compat({ imp: ["dav"] }));
  imp(flatToTestExpLogs_compat({ return: ["dav"] }));
  imp(flatToTestExpLogs_compat({ err: [errorData1 as any] }));
};
