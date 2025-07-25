import { TestProvision } from "^jarun";
import { getJaviConf } from "^javi/getConf";

import { filterConfig, getFixturePath } from "^tests/_fixture";

export default (prov: TestProvision) => {
  prov.imp(filterConfig(getJaviConf(getFixturePath(), "windows")));
};
