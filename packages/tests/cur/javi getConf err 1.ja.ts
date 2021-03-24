import { TestProvision } from "^jarun";
import { getJaviConf } from "^javi/server/getConf";
import { getFixturePath } from "^tests/_fixture";

//json config file contains wrong type. Should be object.

export default (prov: TestProvision) => {
  getJaviConf(getFixturePath(""), "javi.conf.err");
};
