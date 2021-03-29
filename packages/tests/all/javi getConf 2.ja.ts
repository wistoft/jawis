import { TestProvision } from "^jarun";
import { getJaviConf } from "^javi/server/getConf";
import { filterConfig } from "^tests/_fixture";

//conf file doesn't exist.

export default (prov: TestProvision) => {
  prov.imp(filterConfig(getJaviConf("folderWithoutConf")));
};
