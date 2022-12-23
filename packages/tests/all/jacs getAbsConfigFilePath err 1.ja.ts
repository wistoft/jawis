import { getAbsConfigFilePath } from "^ts-config-util";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  prov.imp(getAbsConfigFilePath("/blabla"));
};
