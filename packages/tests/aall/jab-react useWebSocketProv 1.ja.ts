import { renderHookImproved } from "^jawis-mess/node";
import { useWebSocketProv } from "^jab-react";
import { TestProvision } from "^jarun";

//hello

export default (prov: TestProvision) => {
  const { result } = renderHookImproved(useWebSocketProv, {
    URL: "dummy",
    reconnect: true,
  });

  prov.eq("closed", result.wsState);
};
