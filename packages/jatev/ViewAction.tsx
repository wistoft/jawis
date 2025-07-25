import React, { memo } from "react";

import { useFirstRouteEffect } from "^jab-react";

import { ClientMessage, View, ViewProps, ApiProv } from "./internal";

export type ViewActionProps = {
  action: ClientMessage;
} & ViewProps &
  Pick<ApiProv, "apiSend" | "wsState">;

/**
 * Send websocket action 'when' a component mounts.
 *
 * - The action is only performed as a first route effect.
 *
 * impl
 *  - Ensure the inner component isn't mounted before there's a connection.
 */
export const ViewAction: React.FC<ViewActionProps> = memo((props) => {
  if (props.wsState === "connected" || props.wsState === "reconnecting") {
    return <ViewActionInner {...props} />;
  } else {
    return null;
  }
});

ViewAction.displayName = "ViewAction";

/**
 * - The web socket must be connected, when this is called. It would be hard to wait
 *    for connection to become online. Because this might get unmounted in the meantime, and a
 *    cancel would be needed in that case.
 */
const ViewActionInner: React.FC<ViewActionProps> = memo(
  ({ action, wsState, apiSend, ...extra }) => {
    useFirstRouteEffect(() => {
      if (wsState === "connected") {
        apiSend(action);
      } else {
        console.log(
          "Api init, when reconnecting. When can this happen: ",
          wsState
        );
        apiSend(action);
      }
    });

    return <View {...extra} apiSend={apiSend} />;
  }
);

ViewActionInner.displayName = "ViewActionInner";
