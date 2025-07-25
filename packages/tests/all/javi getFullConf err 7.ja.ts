import { TestProvision } from "^jarun";
import { getFullConf } from "^javi/getConf";
import { getFixturePath } from "^tests/_fixture";

//testFolder doesn't exist

export default (prov: TestProvision) => {
  getFullConf({ testFolder: "dontExist" }, getFixturePath(), "windows", true);
};
