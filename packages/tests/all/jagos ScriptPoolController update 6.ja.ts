import fs from "fs";
import { sleeping } from "^yapu";
import { TestProvision } from "^jarun";

import {
  emptyScratchFolder,
  getJabScriptPoolController,
  getScratchPath,
  getScriptPath,
  shutdownQuickFix,
} from "../_fixture";

//a script found in update can be executed.

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController(prov, {
    scriptFolders: [emptyScratchFolder()],
  });

  const script = getScratchPath("script.js");

  fs.copyFileSync(getScriptPath("beeSendAndWait.js"), script);

  pool.updateScripts();

  return pool
    .restartScript(script)
    .then(() => sleeping(100))
    .then(() => shutdownQuickFix(pool));
};
