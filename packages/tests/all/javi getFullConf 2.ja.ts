import { TestProvision } from "^jarun";
import { getFullConf } from "^javi/getConf";
import { filterConfig, getFixturePath } from "^tests/_fixture";

//script are made absolute

export default (prov: TestProvision) => {
  prov.imp(
    filterConfig(
      getFullConf(
        {
          testFolder: "testsuite",
          testLogFolder: "..",
          scriptFolders: ["scripts"],
          scripts: [{ script: "scripts/hello.js" }],
        },
        getFixturePath(),
        "windows"
      )
    )
  );
};
