import { TestProvision } from "^jarun";
import { topologicalLevelSortObject } from "^assorted-algorithms";

import { makeTestJawisBuildManager } from "^tests/_fixture";

export default async (prov: TestProvision) => {
  const tmp = await makeTestJawisBuildManager().getAllPackageDeps(false, true);

  const sorted = topologicalLevelSortObject(tmp);

  console.log(sorted);
};
