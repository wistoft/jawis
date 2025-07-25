import { TestProvision } from "^jarun";

import { getMonorepoProjectPath, webpack_test } from "^tests/_fixture";

export default (prov: TestProvision) =>
  webpack_test(
    getMonorepoProjectPath("packages/first-library/firstLibrarySays.ts")
  ).then(eval);
