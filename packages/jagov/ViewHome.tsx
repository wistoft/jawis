import React, { memo } from "react";

import { Props as ConsoleProps, View as ConsoleView } from "^jadev-console";

import { ViewProcessOverview, Props as P1 } from "./ViewProcessOverview";
import { ApiProv } from ".";

export type ViewHomeProps = P1 &
  ApiProv & {
    jcvProps: Omit<ConsoleProps, "showClearLink">;
  };

export const ViewHome: React.FC<ViewHomeProps> = memo((props) => {
  return (
    <>
      <br />
      <ViewProcessOverview {...props} />
      <br />
      <ConsoleView {...props.jcvProps} showClearLink={false} />
    </>
  );
});

ViewHome.displayName = "ViewHome";
