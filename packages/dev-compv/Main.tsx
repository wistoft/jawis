import React, { memo } from "react";

import { ErrorBoundary, useKeyListener } from "^jab-react";
import { useWebSocketProv } from "^react-use-ws";

import {
  ClientMessage,
  ServerMessage,
  mapWebpackContext,
  useDirector,
  View,
} from "./internal";

type Props = {
  apiPath: string;
  contexts: {
    folder: string;
    context: __WebpackModuleApi.RequireContext;
  }[];
};

/**
 *
 */
export const Main: React.FC<Props> = memo(({ apiPath, contexts }) => {
  const { apiSend, useWsEffect, wsState } = useWebSocketProv<
    ClientMessage,
    ServerMessage
  >({
    URL: "ws://" + apiPath + "/ws",
    reconnect: true,
  });

  const prov = useDirector({
    apiSend,
    useWsEffect,
  });

  return (
    <ErrorBoundary renderOnError={"dev-compv failed"}>
      <View
        {...prov}
        folders={contexts.map((elm) => ({
          folder: elm.folder,
          comps: mapWebpackContext(elm.context),
        }))}
        useKeyListener={useKeyListener}
        wsState={wsState}
      />
    </ErrorBoundary>
  );
});

Main.displayName = "DevComponentPanelMain";
