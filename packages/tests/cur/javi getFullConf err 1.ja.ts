import { TestProvision } from "^jarun";
import { getFullConf } from "^javi/server/getConf";

//test folder must be string

export default (prov: TestProvision) => {
  getFullConf({ testFolder: 1234 }, "folder");
};
