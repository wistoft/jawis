import { TestProvision } from "^jarun";
import { getFullConf } from "^javi/getConf";
import { getFixturePath } from "^tests/_fixture";

//script definition must be object

export default (prov: TestProvision) => {
  getFullConf({ scripts: [null] }, getFixturePath(), "windows");
};
