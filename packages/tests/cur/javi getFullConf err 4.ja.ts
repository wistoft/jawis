import { TestProvision } from "^jarun";
import { getFullConf } from "^javi/server/getConf";

//script in script definition must be string

export default (prov: TestProvision) => {
  getFullConf({ scripts: [{}] }, "folder");
};
