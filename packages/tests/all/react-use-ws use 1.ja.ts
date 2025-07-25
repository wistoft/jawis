import { renderHook } from "^render-hook-plus";
import { useWebSocketProv } from "^react-use-ws";
import { TestProvision } from "^jarun";

//hello

export default (prov: TestProvision) => {
  const { result } = renderHook(useWebSocketProv, {
    URL: "dummy",
    reconnect: true,
  });

  prov.eq("closed", result.wsState);
};
