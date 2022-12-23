import { useEffect } from "react";

import { EventStream } from "^jab";
import { BrowserWebSocket, UseWsEffect } from ".";

/**
 * Make a hook that gives it easy to use a web socket.
 *
 * - Open/close websocket with the component.
 */
export const makeUseWsEffect =
  <ClientMessage, ServerMessage>(
    bws: BrowserWebSocket<ClientMessage, ServerMessage>,
    eventStream: EventStream<ServerMessage>
  ): UseWsEffect<ServerMessage> =>
  (deps) => {
    useEffect(() => {
      bws.openWebSocket().then(deps.onOpen || (() => {}));

      eventStream.addListener(deps.onServerMessage);

      return () => {
        bws.closeWebSocket();
        eventStream.removeListener(deps.onServerMessage);
      };
    }, Object.values(deps));
  };
