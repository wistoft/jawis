import { TestProvision } from "^jarun";
import { getFullConf } from "^javi/server/getConf";
import { getFixturePath } from "^tests/_fixture";

//script doesn't exist

export default (prov: TestProvision) => {
  getFullConf({ scripts: [{ script: "dontExist" }] }, getFixturePath());
};
