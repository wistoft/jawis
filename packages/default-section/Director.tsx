import React, { memo } from "react";

import { JabHttpProvider } from "^jab-react";
import { ErrorBoundary, useMemoDep, useWebSocketProv } from "^jab-react";
import { ClientMessage, ServerMessage, HttpRequest } from "^default-common";

import { View } from "./View";
import { useStateProv } from "./useStateProv";
import { makeOnServerMessage } from "./onServerMessage";

//props

export type Props = {
  apiPath: string;
  style?: React.CSSProperties;
  className?: string;
};

/**
 *
 */
export const Director: React.FC<Props> = memo(
  ({ apiPath, style, className }) => {
    const stateProv = useStateProv();

    const objects = useMemoDep({ apiPath }, createObjectStructure);

    //web socket

    const { apiSend, useWsEffect } = useWebSocketProv<
      ClientMessage,
      ServerMessage
    >({
      URL: "ws://" + apiPath + "/ws",
      reconnect: true,
    });

    useWsEffect({
      onServerMessage: objects.onServerMessage,
    });

    return (
      <div style={style} className={className}>
        <ErrorBoundary renderOnError={"Jade failed"}>
          <View {...stateProv} {...objects} apiSend={apiSend} />
        </ErrorBoundary>
      </div>
    );
  }
);

//
// util
//

type ObjectStructureDeps = {
  apiPath: string;
};

/**
 *
 */
const createObjectStructure = (deps: ObjectStructureDeps) => {
  const httpProv = new JabHttpProvider<HttpRequest>("http://" + deps.apiPath);

  const onServerMessage = makeOnServerMessage(deps);

  return {
    httpProv,
    onServerMessage,
  };
};
