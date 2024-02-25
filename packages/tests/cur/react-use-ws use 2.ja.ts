import { renderHook_e1 } from "^render-hook-plus";
import { useWebSocketProv } from "^react-use-ws";
import { TestProvision } from "^jarun";
import { WebSocketMock } from "^tests/_fixture";
import { sleeping } from "^yapu";

//mount/unmount in connecting state

export default (prov: TestProvision) => {
  const { result } = renderHook_e1(useWebSocketProv, {
    URL: "dummy",
    reconnect: true,
    makeWebSocket: () =>
      new WebSocketMock(prov, {
        beforeOpenEmitted: () =>
          new Promise(() => {
            //never resolve, so the state remains connecting.
          }),
      }) as any,
  });

  //mount

  const { unmount } = renderHook_e1(result.useWsEffect, {
    onServerMessage: () => {},
  });

  unmount();

  //mount

  const { unmount: unmount2 } = renderHook_e1(result.useWsEffect, {
    onServerMessage: () => {},
  });

  unmount2();

  return sleeping(10); //to wait for unmount-exception
};
