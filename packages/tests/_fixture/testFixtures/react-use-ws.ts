import { TestProvision } from "^jarunc";
import {
  BrowserWebSocket,
  Deps,
  useWebSocketProv,
  WebSocketProv,
} from "^react-use-ws";
import { WebSocketMock, WebSocketMockBehavior } from ".";
import { assert } from "^jab";
import { getPromise, poll, PromiseTriple } from "^yapu";
import { renderHook } from "^render-hook-plus";

/**
 *
 */
export const getBrowserWebSocket_connected = async (
  prov: TestProvision,
  extra?: Partial<
    Deps<any> & {
      mock: WebSocketMockBehavior;
    }
  >
) => {
  const socket = getBrowserWebSocket(prov, extra);

  await socket.openWebSocket();

  return socket;
};

/**
 *
 */
export const getBrowserWebSocket = (
  prov: TestProvision,
  extra?: Partial<
    Deps<any> & {
      mock: WebSocketMockBehavior;
    }
  >
) => {
  const bws = new BrowserWebSocket({
    ...prov,
    reconnect: true,
    onServerMessage: (msg) => {
      prov.log("message", msg);
    },
    URL: "dummy",
    makeWebSocket: () =>
      new WebSocketMock(prov, {
        onSend: (data: string) => {
          prov.log("remote message", data);
        },
        ...extra?.mock,
      }) as any,
    ...extra,
  });

  prov.finally(() =>
    assert(
      bws.state === "closed",
      "WebSocketMock was not properly closed, was: " + bws.state
    )
  );

  return bws;
};

export const getReactUseWs_test = (prov: TestProvision) => {
  let cachedParentResult: WebSocketProv<any, any>;
  const acceptConnections: PromiseTriple<void>[] = [];
  const mocks: any[] = [];

  const render = () => {
    const parentResult = renderHook(useWebSocketProv, {
      URL: "dummy",
      reconnect: true,
      makeWebSocket: () => {
        const acceptConnection = getPromise<void>();
        acceptConnections.push(acceptConnection);

        const ws = new WebSocketMock(prov, {
          beforeOpenEmitted: () => acceptConnection.promise,
        });

        mocks.push(ws);

        return ws as any;
      },
    });

    cachedParentResult = parentResult.result;

    const renderSub = () => {
      const result2 = renderHook(parentResult.result.useWsEffect, {
        onServerMessage: () => {},
      });

      return {
        ...result2,
        remoteWs: mocks[mocks.length - 1],
        acceptConnection: acceptConnections[acceptConnections.length - 1],
      };
    };

    return { ...parentResult, renderSub };
  };

  /**
   * needed because the hook has no way to signal, when the bws is closed.
   */
  const waitForAllClosed = async () => {
    // wait for remote websockets to close
    await poll(() => mocks.every((ws) => ws.state === "closed"), 100);
    // wait for wsState in react to change to closed
    await poll(() => cachedParentResult.wsState === "closed", 100);
  };

  return {
    render,
    waitForAllClosed,
    mocks,
  };
};
