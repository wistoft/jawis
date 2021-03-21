import { TestProvision } from "^jarun";
import { getJaviConf } from "^javi/server/getConf";

import { getFixturePath } from "../_fixture";

export default (prov: TestProvision) => {
  prov.imp(getJaviConf(getFixturePath("")));
};
