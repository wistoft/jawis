import ts from "typescript";

import { getAbsConfigFilePath } from "^ts-config-util";
import { TestProvision } from "^jarun";
import { filterAbsoluteFilepath } from "^tests/_fixture";

export default (prov: TestProvision) => {
  prov.imp(filterAbsoluteFilepath(getAbsConfigFilePath(ts, __dirname)));
};
