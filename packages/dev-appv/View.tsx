import React, { memo } from "react";

import { ComponentMenu } from "^jab-react";
import { WsStates } from "^react-use-ws";

import { ViewHome, ViewHomeProps } from "./internal";

export type ViewProps = { wsState: WsStates } & ViewHomeProps;

/**
 *
 */
export const View: React.FC<ViewProps> = memo((props) => (
  <ComponentMenu
    postNav={<>{props.wsState === "reconnecting" && " " + props.wsState}</>}
    routes={[
      {
        name: "Home",
        elm: <ViewHome {...props} />,
      },
    ]}
  />
));

View.displayName = "View";
