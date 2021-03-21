import React, { ReactElement } from "react";
import { RouteComponentProps } from "@reach/router";

import { ErrorBoundary } from "^jab-react";
import { def } from "^jab";

/**
 * Display a message, that no route in found.
 */
export const NoRoute = (props: RouteComponentProps) => {
  const path = def(props.location).pathname.replace(props.uri || "", "");

  return <>No Route for: {path}</>;
};

/**
 * Wraps an element, so it can be used as a <Router>, without mixed the props from reach router
 *  with the one for the component/element.
 *
 * - Drawback: params must be retrieved from useParams(), rather than from props.
 */
export const ReachRoute = ({
  path,
  element,
}: RouteComponentProps & {
  element: ReactElement<unknown>;
}) => (
  <ErrorBoundary renderOnError={"Route failed: " + path}>
    {element}
  </ErrorBoundary>
);
