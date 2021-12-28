import { TestProvision } from "^jarun";

import { director } from "^ts-reload/util";
import { getTsDevDirectorDeps } from "^tests/_fixture";

//director auto starts nothing

export default (prov: TestProvision) => {
  const deps = getTsDevDirectorDeps(prov);

  director(deps);

  return deps.finalProv.runFinally();
};
