import { TestProvision } from "^jarun";
import { getJaviConf } from "^javi/getConf";
import { getFixturePath } from "^tests/_fixture";

//json config file contains wrong type. Should be object.

export default (prov: TestProvision) => {
  getJaviConf(getFixturePath(), "windows", "javi.conf.err");
};
