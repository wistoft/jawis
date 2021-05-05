import React, { memo } from "react";

import { ErrorBoundary, useWebSocketProv } from "^jab-react";
import { Props as ConsoleProps, View as ConsoleView } from "^console";
import { ClientMessage, ServerMessage } from "^jagoc";
import { useDirector, Props as DirectorProps } from "^jagov/useDirector";

//props

export type Props = {
  apiPath: string;
} & Omit<DirectorProps, "useWsEffect" | "apiSend" | "wsState"> &
  Omit<
    ConsoleProps,
    "logs" | "clearAllLogs" | "useToggleEntry" | "useRemoveEntry" | "openFile"
  >;

/**
 * Component that show the console data from browser and/or server scripts.
 *
 */
export const ConsoleMain: React.FC<Props> = memo(({ apiPath, ...extra }) => {
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
      <ConsoleView {...extra} {...prov} />
    </ErrorBoundary>
  );
});
