import { renderHook } from "^render-hook-plus";
import { useWebSocketProv } from "^react-use-ws";
import { TestProvision } from "^jarun";
import { filterReact } from "^tests/_fixture";

//send message before sub hook is mounted.

export default (prov: TestProvision) => {
  filterReact(prov);

  const { result } = renderHook(useWebSocketProv, {
    URL: "dummy",
    reconnect: true,
  });

  result.apiSend({ msg: "dummy" });
};
