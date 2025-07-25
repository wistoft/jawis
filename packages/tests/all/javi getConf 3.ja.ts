import { TestProvision } from "^jarun";
import { getJaviConf } from "^javi/getConf";
import { filterConfig, getScriptPath } from "^tests/_fixture";

//conf file exports nothing.

export default (prov: TestProvision) => {
  prov.imp(filterConfig(getJaviConf(getScriptPath(), "windows", "silent.js")));
};
