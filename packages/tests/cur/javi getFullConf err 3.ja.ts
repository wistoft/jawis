import { TestProvision } from "^jarun";
import { getFullConf } from "^javi/server/getConf";

//script definition must be object

export default (prov: TestProvision) => {
  getFullConf({ scripts: [null] }, "folder");
};
