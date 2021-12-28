import { TestProvision } from "^jarun";

import { getTsProjectPath, nodepack_test } from "^tests/_fixture";

export default (prov: TestProvision) =>
  nodepack_test(getTsProjectPath("hello.ts")).then((data) => eval(data));
