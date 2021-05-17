import { TestProvision } from "^jarun";
import { getJaviConf } from "^javi/server/getConf";
import { emptyScratchFolder, filterConfig } from "^tests/_fixture";

//when conf file doesn't exist.

export default (prov: TestProvision) => {
  prov.imp(filterConfig(getJaviConf(emptyScratchFolder())));
};
