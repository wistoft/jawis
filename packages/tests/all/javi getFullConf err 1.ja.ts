import { TestProvision } from "^jarun";
import { getFullConf } from "^javi/getConf";
import { getFixturePath } from "^tests/_fixture";

//test folder must be string

export default (prov: TestProvision) => {
  getFullConf({ testFolder: 1234 }, getFixturePath());
};
