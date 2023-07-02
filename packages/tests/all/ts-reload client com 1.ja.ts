import { TestProvision } from "^jarun";

import { getClientComController } from "^tests/_fixture";

//logging with 'script index' as prefix

export default (prov: TestProvision) => {
  const { deps, cont } = getClientComController(prov);

  cont.onScriptOutput(deps.scripts[0].script, { type: "stdout", data: "hej" });
  cont.onScriptOutput(deps.scripts[0].script, { type: "stdout", data: "igen" });
  cont.onScriptOutput(deps.scripts[0].script, { type: "stderr", data: "ups" });
};
