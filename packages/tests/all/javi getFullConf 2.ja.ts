import { TestProvision } from "^jarun";
import { getFullConf } from "^javi/server/getConf";
import { filterConfig, getFixturePath } from "^tests/_fixture";

//script are made absolute

export default (prov: TestProvision) => {
  prov.imp(
    filterConfig(
      getFullConf(
        { scripts: [{ script: "scripts/hello.js", autoStart: false }] },
        getFixturePath()
      )
    ).scripts
  );
};
