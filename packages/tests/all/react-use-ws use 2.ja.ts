import { renderHook } from "^render-hook-plus";
import { useWebSocketProv } from "^react-use-ws";
import { TestProvision } from "^jarun";
import { WebSocketMock } from "^tests/_fixture";
import { getPromise, poll } from "^yapu";
import { assertEq } from "^jab";

//mount/unmount in connecting state

export default async (prov: TestProvision) => {
  const acceptConnection = getPromise<void>();
  const mocks: any[] = [];

  const parent = renderHook(useWebSocketProv, {
    URL: "dummy",
    reconnect: true,
    makeWebSocket: () => {
      const ws = new WebSocketMock(prov, {
        //resolve after all mount/unmount is done, so it's closed before it reaches connected state.
        beforeOpenEmitted: () => acceptConnection.promise,
      });

      mocks.push(ws);

      return ws as any;
    },
  });

  //mount

  const { unmount } = renderHook(parent.result.useWsEffect, {
    onServerMessage: () => {},
  });

  unmount();

  await poll(() => parent.rerender().wsState === "closed"); // is only logically closed

  //mount

  const { unmount: unmount2 } = renderHook(parent.result.useWsEffect, {
    onServerMessage: () => {},
  });

  assertEq(parent.rerender().wsState, "connecting");

  unmount2();

  await poll(() => parent.rerender().wsState === "closed"); // is only logically closed

  //this will establish connection, and the websockets will be able to gracefully close.

  acceptConnection.resolve();

  //needed because the hook has no way to signal, when the bws is closed.

  return poll(() => mocks.every((ws) => ws.state === "closed"), 100);
};
