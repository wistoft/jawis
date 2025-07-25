import { TestProvision } from "^jarun";

import { getTsProjectPath, nodepack_test } from "^tests/_fixture";

// compile for node

export default async (prov: TestProvision) => {
  const code = await nodepack_test(getTsProjectPath("hello.ts"));

  const exports = module.exports; //quick because when this is changed, then jarun can't rerun the test case.

  eval(code);

  module.exports = exports;
};
