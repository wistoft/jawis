import { getAbsConfigFilePath } from "^jacs";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  prov.imp(getAbsConfigFilePath("/blabla"));
};
