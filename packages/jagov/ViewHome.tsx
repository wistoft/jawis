import React, { memo } from "react";

import { ViewProps as ConsoleProps, View as ConsoleView } from "^console";

import {
  ViewProcessOverview,
  ViewProcessOverviewProps,
  ApiProv,
} from "./internal";

export type ViewHomeProps = ViewProcessOverviewProps &
  ApiProv & {
    jcvProps: Omit<ConsoleProps, "showClearLink">;
  };

export const ViewHome: React.FC<ViewHomeProps> = memo((props) => (
  <>
    <br />
    <ViewProcessOverview {...props} />
    <br />
    <ConsoleView {...props.jcvProps} showClearLink={false} />
  </>
));

ViewHome.displayName = "ViewHome";
