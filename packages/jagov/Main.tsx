import React, { memo } from "react";

import { useWebSocketProv } from "^use-websocket";
import { ClientMessage, ServerMessage } from "^jagoc";

import { View, Props as ViewProps } from "./View";
import { useDirector, DirectorProps } from "./useDirector";

//props

export type Props = {
  apiPath: string;
} & Omit<
  DirectorProps,
  "useWsEffect" | "apiSend" | "wsState" | "useConsoleStream"
> &
  Omit<
    ViewProps,
    "processStatus" | "jcvProps" | "apiSend" | "wsState" | "useApiSend"
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
    <View
      {...extra}
      {...prov}
      apiSend={apiSend}
      wsState={wsState}
      jcvProps={{ ...extra, ...prov }}
    />
  );
});
