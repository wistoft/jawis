import path from "path";
import { nodeRequire } from "^jab-node";

import { getAbsConfigFilePath } from "^jacs";
import { TestProvision } from "^jarun";

const projectConf = eval("require")("../../../project.conf");

export default (prov: TestProvision) => {
  prov.imp(
    path
      .relative(projectConf.packageFolder, getAbsConfigFilePath(__dirname))
      .replace(/\\/g, "/")
  );
};
