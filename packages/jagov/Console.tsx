import React, { memo, useState } from "react";

import { ErrorBoundary } from "^jab-react";
import { ViewProps, View, makeUseConsoleStream } from "^console";
import { useWebSocketProv } from "^react-use-ws";

import {
  ClientMessage,
  ServerMessage,
  useDirector,
  DirectorProps,
} from "./internal";

export type ConsoleProps = {
  apiPath: string;
} & Omit<DirectorProps, "useWsEffect" | "apiSend" | "wsState"> &
  Omit<
    ViewProps,
    "logs" | "clearAllLogs" | "useToggleEntry" | "useRemoveEntry" | "openFile"
  >;

/**
 * Component that show the console logs from server and/or browser.
 *
 * - Not used by jago itself. But meant for adding jago console to other pages.
 */
export const Console: React.FC<ConsoleProps> = memo(({ apiPath, ...extra }) => {
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

  //listen to console data from the browser.

  const [useConsoleStream] = useState(makeUseConsoleStream);

  useConsoleStream((entries) => prov.addData(entries, true));

  return (
    <ErrorBoundary renderOnError={"Jago Console failed"}>
      <View {...extra} {...prov} />
    </ErrorBoundary>
  );
});
