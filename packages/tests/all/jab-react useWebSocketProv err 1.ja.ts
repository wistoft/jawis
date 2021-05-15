import { wrapHook } from "^misc/node";
import { useWebSocketProv } from "^jab-react";
import { TestProvision } from "^jarun";

//URL must not change between renders

export default (prov: TestProvision) => {
  const { hook } = wrapHook(useWebSocketProv, {
    URL: "dummy",
    reconnect: true,
  });

  hook({ URL: "other dummy", reconnect: true });
};
