import { getTsConfigFromAbsConfigFile } from "^jacs";
import { TestProvision } from "^jarun";
import { getTsProjectPath } from "^tests/_fixture";
import { CompilerOptions } from "typescript";

export default (prov: TestProvision): CompilerOptions =>
  getTsConfigFromAbsConfigFile(getTsProjectPath("tsconfigMalformed.json"));
