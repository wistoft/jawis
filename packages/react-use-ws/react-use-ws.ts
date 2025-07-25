import { useState, useEffect } from "react";

import {
  BrowserWebSocket,
  WsStates,
  Deps as BwsDeps,
  WebSocketProv,
  UseWsEffectArgs,
  assert,
} from "./internal";

type Deps = {
  URL: string;
  reconnect: boolean;

  //for testing
  makeWebSocket?: () => WebSocket;
};

/**
 * Easily use web sockets in react components.
 *
 * - Returns a react useEffect, that takes an onOpen and onServerMessage callback.
 * - Provides the status/state of the web socket connection. e.g. closed, open.
 * - The web socket will be opened at component mount, and closed at unmount, which
 *    it must do in react.
 * - Props must be remain content. Changing props isn't supported.
 */
export const useWebSocketProv = <MS, MR>(deps: Deps): WebSocketProv<MS, MR> => {
  const [initialDeps] = useState(deps);

  assert(deps.URL === initialDeps.URL, "URL must not change");
  assert(deps.reconnect === initialDeps.reconnect, "reconnect boolean must not change"); // prettier-ignore

  const [wsState, onStateChange] = useState("closed" as WsStates);

  const [objects] = useState(() =>
    createStructure<MS, MR>({ ...deps, onStateChange })
  );

  return { ...objects, wsState };
};

/**
 *
 * - Ensure onStateChange isn't called for unmounted components.
 */
const createStructure = <MS, MR>(
  deps: Deps & Pick<BwsDeps<MR>, "onStateChange">
) => {
  let bws: BrowserWebSocket<MS, MR> | undefined;

  const apiSend = (data: MS) => {
    if (!bws) {
      console.log("Socket is closed.");
      return;
    }

    bws.apiSend(data);
  };

  return {
    apiSend,
    useWsEffect: (inner: UseWsEffectArgs<MR>) => {
      useEffect(() => {
        if (bws) {
          throw new Error("Impossible");
        }

        let active = true;

        const onStateChange = (data: any) => {
          if (active) {
            deps.onStateChange?.(data);
          }
        };

        const onServerMessage = (data: any) => {
          if (active) {
            inner.onServerMessage?.(data);
          }
        };

        bws = new BrowserWebSocket<MS, MR>({
          URL: deps.URL,
          onServerMessage,
          reconnect: deps.reconnect,
          onStateChange,
          onError: () => {
            //todo:  this error could tell the URL at least.
          },
          makeWebSocket: deps.makeWebSocket,
        });

        bws.openWebSocket().then(inner.onOpen || (() => {}));

        return () => {
          if (!bws) {
            throw new Error("Impossible");
          }

          try {
            bws.closeWebSocket();
          } finally {
            bws = undefined;
            active = false;
          }
        };
      }, Object.values(inner));
    },
  };
};
