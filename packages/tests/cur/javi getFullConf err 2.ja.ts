import { TestProvision } from "^jarun";
import { getFullConf } from "^javi/server/getConf";

//script folders must be string

export default (prov: TestProvision) => {
  getFullConf({ scriptFolders: [1234] }, "folder");
};
