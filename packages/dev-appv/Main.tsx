import React, { memo } from "react";

import { ErrorBoundary, useWebSocketProv } from "^jab-react";

import { View, Props as ViewProps } from "./View";
import { useDirector, Props as DirectorProps } from "./useDirector";
import { ClientMessage, ServerMessage } from "^dev-appc";

export type Props = {
  apiPath: string;
};

/**
 *
 */
export const Main: React.FC<Props> = memo(({ apiPath }) => {
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
      <View {...prov} apiSend={apiSend} wsState={wsState} />
    </ErrorBoundary>
  );
});
