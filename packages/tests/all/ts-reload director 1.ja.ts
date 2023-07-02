import { TestProvision } from "^jarun";

import { director } from "^ts-reload/util";
import { getTsReloadDirectorDeps } from "^tests/_fixture";

//director auto starts nothing

export default (prov: TestProvision) => {
  const deps = getTsReloadDirectorDeps(prov);

  director(deps);

  return deps.finalProv.runFinally();
};
