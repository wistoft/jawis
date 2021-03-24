import { useEffect } from "react";

import { BrowserWebSocket } from "^jab-react";
import { EventStream } from "^jab";

export type UseWsEffectArgs<ServerMessage> = {
  onOpen?: () => void;
  onServerMessage: (data: ServerMessage) => void;
};

export type UseWsEffect<ServerMessage> = (
  deps: UseWsEffectArgs<ServerMessage>
) => void;

/**
 * Make a hook that gives it easy to use a web socket.
 *
 * - Open/close websocket with the component.
 */
export const makeUseWsEffect = <ClientMessage, ServerMessage>(
  bws: BrowserWebSocket<ClientMessage, ServerMessage>,
  eventStream: EventStream<ServerMessage>
): UseWsEffect<ServerMessage> => (deps) => {
  useEffect(() => {
    bws.openWebSocket().then(deps.onOpen || (() => {}));

    eventStream.addListener(deps.onServerMessage);

    return () => {
      bws.closeWebSocket();
      eventStream.removeListener(deps.onServerMessage);
    };
  }, Object.values(deps));
};
