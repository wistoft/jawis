import { renderHookImproved } from "^jawis-mess/node";
import { useWebSocketProv } from "^jab-react";
import { TestProvision } from "^jarun";

//URL must not change between renders

export default (prov: TestProvision) => {
  const { rerender } = renderHookImproved(useWebSocketProv, {
    URL: "dummy",
    reconnect: true,
  });

  rerender({ URL: "other dummy", reconnect: true });
};
