import { TestProvision } from "^jarun";
import { filterScriptStatuses } from "^tests/_fixture/testFixtures/jagos";

import { getJabScriptPoolController, getScriptPath } from "../_fixture";

//running scripts will be preserved at update

export default (prov: TestProvision) => {
  const script = getScriptPath("beeSendAndWait.js");

  const pool = getJabScriptPoolController(prov, {
    scriptFolders: [getScriptPath()],
  });

  const preCount = pool.getScriptStatus().length;

  return pool
    .restartScript(script)

    .then(() => {
      pool.updateScripts();

      //all scripts are there
      prov.eq(preCount, pool.getScriptStatus().length);

      //it's status is not affect by the update

      prov.imp(
        filterScriptStatuses(
          pool.getScriptStatus().filter((status) => status.script === script)
        )
      );
    })
    .then(pool.shutdown);
};
