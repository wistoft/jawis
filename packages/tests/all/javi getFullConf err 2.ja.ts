import { TestProvision } from "^jarun";
import { getFullConf } from "^javi/getConf";
import { getFixturePath } from "^tests/_fixture";

//script folders must be string

export default (prov: TestProvision) => {
  getFullConf({ scriptFolders: [1234] }, getFixturePath());
};
