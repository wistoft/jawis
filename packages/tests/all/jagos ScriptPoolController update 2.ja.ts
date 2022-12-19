import fs from "fs";
import { sleeping } from "^yapu";
import { TestProvision } from "^jarun";

import {
  getJabScriptPoolController,
  getScratchPath,
  getScriptPath,
} from "../_fixture";

//delete script while running. It will still be in the list.
//When it's stopped, it will be removed.

export default (prov: TestProvision) => {
  const script = getScratchPath("script.js");

  fs.copyFileSync(getScriptPath("beeSendAndWait.js"), script);

  const pool = getJabScriptPoolController(prov, {
    scriptFolders: [getScratchPath()],
  });

  prov.eq(1, pool.getScriptStatus().length);

  return pool
    .restartScript(script)
    .then(() => sleeping(100))
    .then(() => {
      fs.unlinkSync(script);

      //the deleted script will not be removed, because it's running.
      pool.updateScripts();

      prov.eq(1, pool.getScriptStatus().length);
    })
    .then(pool.ensureAllScriptsStopped)
    .then(() => {
      //now the script is stopped, so it will be removed from the list.
      pool.updateScripts();

      prov.eq([], pool.getScriptStatus());
    })
    .then(pool.shutdown);
};
