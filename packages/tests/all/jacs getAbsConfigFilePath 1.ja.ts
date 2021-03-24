import path from "path";
import projectConf from "^config/project.conf";
import { getAbsConfigFilePath } from "^jacs";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  prov.imp(
    path
      .relative(projectConf.packageFolder, getAbsConfigFilePath(__dirname))
      .replace(/\\/g, "/")
  );
};
