import path from "path";
import { TestProvision } from "^jarun";
import { getFullConf } from "^javi/getConf";
import { getFixturePath } from "^tests/_fixture";

//absolute script doesn't exist

export default (prov: TestProvision) => {
  getFullConf(
    { scripts: [{ script: path.join(__dirname, "dontExists") }] },
    getFixturePath(),
    true
  );
};
