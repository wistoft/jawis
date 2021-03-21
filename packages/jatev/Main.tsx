import React, { memo } from "react";

import {
  useWebSocketProv,
  useKeyListener,
  ErrorBoundary,
  ComponentMenu,
} from "^jab-react";
import { getRandomInteger } from "^jab";
import { ClientMessage, ServerMessage } from "^jatec";

import { useDirector, Props as DirectorProps } from "./useDirector";

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
    apiSend: apiSend,
    wsState: wsState,
    useWsEffect: useWsEffect,
    getRandomToken: getRandomInteger,
    useKeyListener: useKeyListener,
  });

  return (
    <ErrorBoundary renderOnError={"Jatev failed"}>
      <ComponentMenu postNav={prov.postNav} routes={prov.routes} />
    </ErrorBoundary>
  );
});
