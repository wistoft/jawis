import React, { memo } from "react";

import { ComponentMenu, NoRoute, ReachRoute, WsStates } from "^jab-react";

import { ViewHome, Props as ViewHomeProps } from "./ViewHome";

export type Props = { wsState: WsStates } & ViewHomeProps;

/**
 *
 */
export const View: React.FC<Props> = memo((props) => (
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
