import { TestProvision } from "^jarun";
import { getFullConf } from "^javi/server/getConf";
import { getFixturePath } from "^tests/_fixture";

//script folder doesn't exist

export default (prov: TestProvision) => {
  getFullConf({ scriptFolders: ["dontExist"] }, getFixturePath());
};
