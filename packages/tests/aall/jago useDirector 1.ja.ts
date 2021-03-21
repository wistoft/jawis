import { TestProvision } from "^jarun";

import { ScriptStatus } from "^jagoc";
import { renderUseJagoDirector } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const { result, onServerMessage, rerender } = renderUseJagoDirector(prov);

  // no info before a message from the server

  prov.eq(undefined, result.processStatus);

  //message from server message

  const status: ScriptStatus[] = [
    { id: "scriptId", script: "path/to/script.js", status: "stopped" },
  ];

  onServerMessage({
    type: "processStatus",
    data: status,
  });

  // check state is updated

  prov.eq(status, rerender().processStatus);
};
