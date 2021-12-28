import path from "path";
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
          scriptFolders: [getFixturePath()],
          scripts: [
            {
              script: path.join(getFixturePath(), "scripts/hello.js"),
            },
          ],
        },
        __dirname //this has no significance, when absolute files are given.
      )
    )
  );
};
