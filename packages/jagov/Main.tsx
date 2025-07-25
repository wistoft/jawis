import React, { memo } from "react";

import { ErrorBoundary } from "^jab-react";
import { useWebSocketProv } from "^react-use-ws";

import {
  ClientMessage,
  ServerMessage,
  View,
  ViewProps,
  useDirector,
  DirectorProps,
} from "./internal";

export type Props = {
  apiPath: string;
} & Omit<DirectorProps, "useWsEffect" | "apiSend" | "wsState"> &
  Omit<
    ViewProps,
    | "processStatus"
    | "jcvProps"
    | "apiSend"
    | "wsState"
    | "restartAll"
    | "stopAll"
  > &
  //raise the jcvProps to top-level
  Omit<
    ViewProps["jcvProps"],
    "logs" | "clearAllLogs" | "useToggleEntry" | "useRemoveEntry" | "openFile"
  >;

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
    apiSend,
    useWsEffect,
  });

  return (
    <ErrorBoundary renderOnError={"Jagov failed"}>
      <View
        {...extra}
        {...prov}
        apiSend={apiSend}
        wsState={wsState}
        jcvProps={{ ...extra, ...prov }}
      />
    </ErrorBoundary>
  );
});

Main.displayName = "JagoMain";
