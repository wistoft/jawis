import { TestProvision } from "^jarun";
import { getJaviConf } from "^javi/getConf";
import { filterConfig, getFixturePath } from "^tests/_fixture";

//when conf file doesn't exist.

export default (prov: TestProvision) => {
  prov.imp(filterConfig(getJaviConf(getFixturePath(".."), "windows")));
};
