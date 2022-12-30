import React, { memo, useCallback } from "react";

import { ClientMessage, ServerMessage } from "^jagoc";

import { ErrorBoundary, useKeyListener } from "^jab-react";
import { useWebSocketProv } from "^use-websocket";

import { View, mapWebpackContext } from "./internal";

export type ComponentDef = {
  name: string;
  path: string;
  comp: React.ComponentType<unknown> | (() => void);
};

type Props = {
  apiPath: string;
  contexts: {
    folder: string;
    context: __WebpackModuleApi.RequireContext;
  }[];
};

const noop = () => {};

/**
 *
 */
export const Main: React.FC<Props> = memo(({ apiPath, contexts }) => {
  //connect to jago

  const { apiSend, useWsEffect } = useWebSocketProv<
    ClientMessage,
    ServerMessage
  >({
    URL: "ws://" + apiPath + "/ws",
    reconnect: true,
  });

  useWsEffect({ onServerMessage: noop });

  //callback

  const openComponnent = useCallback(
    (compPath: string) => {
      apiSend({ type: "openRelFile", file: compPath });
    },
    [apiSend]
  );

  return (
    <ErrorBoundary renderOnError={"dev-compv failed"}>
      <View
        folders={contexts.map((elm) => ({
          folder: elm.folder,
          comps: mapWebpackContext(elm.context),
        }))}
        openComponnent={openComponnent}
        useKeyListener={useKeyListener}
      />
    </ErrorBoundary>
  );
});

Main.displayName = "DevComponentPanelMain";
