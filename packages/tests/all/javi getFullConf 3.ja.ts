import { TestProvision } from "^jarun";
import { getFullConf } from "^javi/getConf";
import { filterConfig, getFixturePath } from "^tests/_fixture";

//absolute files are allowed for: testFolder, scriptFolders, scripts.

export default (prov: TestProvision) => {
  prov.imp(
    filterConfig(
      getFullConf(
        {
          testFolder: getFixturePath(),
          testLogFolder: getFixturePath(),
          scriptFolders: [getFixturePath()],
          scripts: [
            {
              script: getFixturePath("scripts/hello.js"),
            },
          ],
        },
        getFixturePath(),
        "windows"
      )
    )
  );
};
