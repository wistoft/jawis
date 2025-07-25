import ts, { CompilerOptions } from "typescript";
import { getTsConfigFromAbsConfigFile } from "^ts-config-util";
import { TestProvision } from "^jarun";
import { getTsProjectPath } from "^tests/_fixture";

export default (prov: TestProvision): CompilerOptions =>
  getTsConfigFromAbsConfigFile(ts, getTsProjectPath("tsconfigMalformed.json"));
