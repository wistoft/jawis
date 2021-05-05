import React, { memo } from "react";

import { ComponentMenu, NoRoute, ReachRoute } from "^jab-react";

import { ViewHome, Props as ViewHomeProps } from "./ViewHome";

export type Props = ViewHomeProps;

/**
 *
 */
export const View: React.FC<Props> = memo((props) => (
  <ComponentMenu
    routes={[
      {
        name: "Home",
        elm: <ViewHome {...props} />,
      },
    ]}
  />
));

View.displayName = "View";
