import { getTsConfigFromAbsConfigFile } from "^jacs";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  return getTsConfigFromAbsConfigFile("dontExist");
};
