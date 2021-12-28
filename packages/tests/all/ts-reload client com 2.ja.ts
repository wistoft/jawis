import { TestProvision } from "^jarun";

import { errorData1, getClientComController } from "^tests/_fixture";

import { cloneArrayEntries } from "^jab";

//logging with 'script name' as prefix

export default (prov: TestProvision) => {
  const { deps, cont } = getClientComController(prov, {
    indexPrefix: false,
  });

  cont.onScriptOutput(deps.scripts[0].script, { type: "stdout", data: "hej" });
  cont.onScriptOutput(deps.scripts[0].script, { type: "stdout", data: "igen" });
  cont.onScriptOutput(deps.scripts[0].script, { type: "stderr", data: "ups" });

  //logs

  cont.onScriptOutput(deps.scripts[0].script, {
    type: "log",
    data: { type: "log", data: cloneArrayEntries([true, "dav", undefined]) },
  });

  //errors

  cont.onScriptOutput(deps.scripts[0].script, {
    type: "log",
    data: { type: "error", data: errorData1 },
  });
};
