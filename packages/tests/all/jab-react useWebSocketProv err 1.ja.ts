import { renderHook } from "^render-hook-plus";
import { useWebSocketProv } from "^react-use-ws";
import { TestProvision } from "^jarun";
import { filterReact } from "^tests/_fixture";

//URL must not change between renders

export default (prov: TestProvision) => {
  filterReact(prov);

  const { hook } = renderHook(useWebSocketProv, {
    URL: "dummy",
    reconnect: true,
  });

  hook({ URL: "other dummy", reconnect: true });
};
