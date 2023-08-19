import ts from "typescript";

import { getTsConfigFromAbsConfigFile } from "^ts-config-util";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  return getTsConfigFromAbsConfigFile(ts, "dontExist");
};
