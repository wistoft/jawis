import { useState } from "react";

import { EventController } from "^jab";
import { useAssertStatic, useUnmountSafeFunction } from "^jab-react";

import { makeUseWsEffect } from "./makeUseWsEffect";
import { BrowserWebSocket, WsStates, Deps as BwsDeps, WebSocketProv } from ".";

type Deps = {
  URL: string;
  reconnect: boolean;
};

/**
 * - setup up for easy use of a web socket in components. A react useEffect, that
 *    - takes an onOpen and onServerMessage callback.
 * - provide the status/state of the web socket connection. e.g. closed, open.
 * - don't open the web socket yet. It will be done on component mount.
 * - Props must not change. There's not really a use case for that.
 */
export const useWebSocketProv = <MS, MR>(deps: Deps): WebSocketProv<MS, MR> => {
  useAssertStatic(deps);

  const [wsState, setWsState] = useState("closed" as WsStates);

  const onStateChange = useUnmountSafeFunction(setWsState); // needed because we can't remove `onStateChange` from BWS.

  const [objects] = useState(() =>
    createObjectState<MS, MR>({ ...deps, onStateChange })
  );

  return { ...objects, wsState };
};

/**
 *
 */
const createObjectState = <MS, MR>(
  deps: Deps & Pick<BwsDeps<MR>, "onStateChange">
) => {
  const eventStream = new EventController<MR>();

  const bws = new BrowserWebSocket<MS, MR>({
    URL: deps.URL,
    onServerMesssage: eventStream.fireEvent,
    reconnect: deps.reconnect,
    onStateChange: deps.onStateChange,
    onError: (event) => {
      console.log("ws failed", event);
    },
  });

  const useWsEffect = makeUseWsEffect(bws, eventStream);

  return {
    apiSend: bws.apiSend,
    useWsEffect,
  };
};
