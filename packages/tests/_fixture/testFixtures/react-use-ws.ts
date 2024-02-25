import { TestProvision } from "^jarunc";
import { BrowserWebSocket, Deps } from "^react-use-ws";
import { WebSocketMock, WebSocketMockBehavior } from ".";

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
) =>
  new BrowserWebSocket({
    ...prov,
    reconnect: true,
    onServerMesssage: (msg) => {
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
