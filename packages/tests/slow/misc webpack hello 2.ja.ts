import { TestProvision } from "^jarun";

import { getTsProjectPath, webpack_test } from "^tests/_fixture";

export default (prov: TestProvision) =>
  webpack_test(getTsProjectPath("helloWeb.ts")).then((data) => eval(data));
