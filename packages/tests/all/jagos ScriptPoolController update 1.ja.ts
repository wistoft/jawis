import fs from "fs";
import { TestProvision } from "^jarun";
import { filterScriptStatuses } from "^tests/_fixture/testFixtures/jagos";

import {
  emptyScratchFolder,
  getJabScriptPoolController,
  getScratchPath,
} from "../_fixture";

//empty folder at init, then file is added, then removed

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController(prov, {
    scriptFolders: [emptyScratchFolder()],
  });

  prov.eq([], pool.getScriptStatus());

  //add file

  fs.writeFileSync(getScratchPath("myScript.ts"), "bla");

  pool.updateScripts();

  prov.eq("stopped", pool.getSingleScriptStatus(getScratchPath("myScript.ts")));

  //remove file again

  emptyScratchFolder();

  pool.updateScripts();

  prov.eq([], pool.getScriptStatus());

  //done

  return pool.shutdown();
};
