import React, { memo } from "react";

import { ErrorBoundary } from "^jab-react";

import { ViewProps, View, useDirector } from "./internal";

type Props = Omit<
  ViewProps,
  | "logs"
  | "clearAllLogs"
  | "useToggleEntry"
  | "useRemoveEntry"
  | "openFile"
  | "projectRoot"
> & {
  projectRoot?: string;
};

/**
 * Component that show the console data from browser.
 */
export const Console: React.FC<Props> = memo((props) => {
  const prov = useDirector();

  const extra = {
    projectRoot: "", //optional, because it's not essential
    ...props,
  };

  return (
    <ErrorBoundary renderOnError={"Console failed"}>
      <View {...extra} {...prov} />
    </ErrorBoundary>
  );
});
