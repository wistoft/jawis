import React, { memo } from "react";

import { ErrorBoundary } from "^jab-react";
import { useWebSocketProv } from "^react-use-ws";

import { ClientMessage, ServerMessage, useDirector, View } from "./internal";

export type Props = {
  apiPath: string;
};

/**
 *
 */
export const Main: React.FC<Props> = memo(({ apiPath, ...extra }) => {
  const { apiSend, useWsEffect, wsState } = useWebSocketProv<
    ClientMessage,
    ServerMessage
  >({
    URL: "ws://" + apiPath + "/ws",
    reconnect: true,
  });

  const prov = useDirector({
    apiPath,
    apiSend,
    useWsEffect,
  });

  return (
    <ErrorBoundary renderOnError={"dev-app failed"}>
      <View {...extra} {...prov} apiSend={apiSend} wsState={wsState} />
    </ErrorBoundary>
  );
});

Main.displayName = "DevAppMain";
