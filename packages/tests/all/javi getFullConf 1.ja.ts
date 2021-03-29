import { TestProvision } from "^jarun";
import { getFullConf } from "^javi/server/getConf";
import { filterConfig } from "^tests/_fixture";

//default conf

export default (prov: TestProvision) => {
  prov.imp(filterConfig(getFullConf({}, "folder")));
};
