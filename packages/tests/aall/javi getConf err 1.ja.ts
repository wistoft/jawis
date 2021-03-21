import { TestProvision } from "^jarun";
import { getJaviConf } from "^javi/server/getConf";

export default (prov: TestProvision) => {
  prov.imp(getJaviConf("dontExist"));
};
