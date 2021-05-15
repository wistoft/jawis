import { wrapHook } from "^misc/node";
import { useWebSocketProv } from "^jab-react";
import { TestProvision } from "^jarun";

//hello

export default (prov: TestProvision) => {
  const { result } = wrapHook(useWebSocketProv, {
    URL: "dummy",
    reconnect: true,
  });

  prov.eq("closed", result.wsState);
};
