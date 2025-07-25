import { TestProvision } from "^jarun";
import { getFullConf } from "^javi/getConf";
import { getFixturePath } from "^tests/_fixture";

export default (prov: TestProvision) => {
  getFullConf({ confDontExist: true }, getFixturePath(), "windows");
};
