import { TestProvision } from "^jarun";

import { getTsProjectPath, webpack_test } from "^tests/_fixture";

// compile for web

export default (prov: TestProvision) =>
  webpack_test(getTsProjectPath("hello.ts")).then(eval);
//
