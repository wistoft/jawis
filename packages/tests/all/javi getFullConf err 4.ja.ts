import { TestProvision } from "^jarun";
import { getFullConf } from "^javi/getConf";
import { getFixturePath } from "^tests/_fixture";

//script in script definition must be string

export default (prov: TestProvision) => {
  getFullConf({ scripts: [{}] }, getFixturePath(), "windows");
};
