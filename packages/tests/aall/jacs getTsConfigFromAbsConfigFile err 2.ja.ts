import { getTsConfigFromAbsConfigFile } from "^jacs";
import { TestProvision } from "^jarun";
import { getTsProjectPath } from "^tests/_fixture";

export default (prov: TestProvision) =>
  getTsConfigFromAbsConfigFile(getTsProjectPath("tsconfigMalformed.json"));
