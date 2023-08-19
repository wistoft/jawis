import path from "path";
import ts from "typescript";

import { getAbsConfigFilePath } from "^ts-config-util";
import { TestProvision } from "^jarun";

const projectConf = eval("require")("../../../packages/dev/project.conf");

export default (prov: TestProvision) => {
  prov.imp(
    path
      .relative(projectConf.packageFolder, getAbsConfigFilePath(ts, __dirname))
      .replace(/\\/g, "/")
  );
};
