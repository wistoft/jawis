import { TestProvision } from "^jarun";
import { getFullConf } from "^javi/getConf";
import { filterConfig, getFixturePath } from "^tests/_fixture";

//default conf

export default (prov: TestProvision) => {
  prov.imp(filterConfig(getFullConf({}, getFixturePath(), "windows")));
};
