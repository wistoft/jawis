import ts, { CompilerOptions } from "typescript";
import { getTsConfigFromAbsConfigFile } from "^ts-config-util";
import { TestProvision } from "^jarun";

export default (prov: TestProvision): CompilerOptions => {
  return getTsConfigFromAbsConfigFile(ts, "dontExist");
};
