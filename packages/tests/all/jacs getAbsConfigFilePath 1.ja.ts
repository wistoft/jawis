import { getAbsConfigFilePath } from "^jacs";
import { TestProvision } from "^jarun";
import { filterFilepath } from "^tests/_fixture";

export default (prov: TestProvision) => {
  prov.imp(filterFilepath(getAbsConfigFilePath(__dirname)));
};
