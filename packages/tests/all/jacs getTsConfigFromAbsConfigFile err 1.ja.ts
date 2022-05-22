import { getTsConfigFromAbsConfigFile } from "^jacs";
import { TestProvision } from "^jarun";
import { CompilerOptions } from "typescript";

export default (prov: TestProvision): CompilerOptions => {
  return getTsConfigFromAbsConfigFile("dontExist");
};
