import React, { memo } from "react";

import { useKeyListener, ErrorBoundary, ComponentMenu } from "^jab-react";
import { useWebSocketProv } from "^react-use-ws";
import { getRandomInteger } from "^jab";

import {
  useDirector,
  DirectorProps,
  ClientMessage,
  ServerMessage,
} from "./internal";

export type Props = {
  apiPath: string;
} & Omit<
  DirectorProps,
  "apiSend" | "wsState" | "useWsEffect" | "getRandomToken" | "useKeyListener"
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
    ...extra,
    apiSend,
    wsState,
    useWsEffect,
    useKeyListener,
    getRandomToken: getRandomInteger,
  });

  return (
    <ErrorBoundary renderOnError={"Jatev failed"}>
      <ComponentMenu postNav={prov.postNav} routes={prov.routes} />
    </ErrorBoundary>
  );
});

Main.displayName = "JatevMain";
