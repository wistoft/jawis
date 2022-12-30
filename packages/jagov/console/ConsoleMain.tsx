import React, { memo } from "react";

import { ErrorBoundary } from "^jab-react";
import { ViewProps, View } from "^console";
import { ClientMessage, ServerMessage } from "^jagoc";
import { useWebSocketProv } from "^react-use-ws";
import { useDirector, DirectorProps } from "^jagov/useDirector";

//props

export type ConsoleProps = {
  apiPath: string;
} & Omit<DirectorProps, "useWsEffect" | "apiSend" | "wsState"> &
  Omit<
    ViewProps,
    "logs" | "clearAllLogs" | "useToggleEntry" | "useRemoveEntry" | "openFile"
  >;

/**
 * Component that show the console data from browser and/or server scripts.
 *
 */
export const ConsoleMain: React.FC<ConsoleProps> = memo(
  ({ apiPath, ...extra }) => {
    const { apiSend, useWsEffect } = useWebSocketProv<
      ClientMessage,
      ServerMessage
    >({
      URL: "ws://" + apiPath + "/ws",
      reconnect: true,
    });

    const prov = useDirector({
      ...extra,
      apiSend,
      useWsEffect,
    });

    return (
      <ErrorBoundary renderOnError={"Jago Console failed"}>
        <View {...extra} {...prov} />
      </ErrorBoundary>
    );
  }
);
