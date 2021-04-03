import "./style.css";

import React from "react";

import { ErrorBoundary, useObject, ComponentMenu } from "^jab-react";
import { Main as JatevMain, Props as JatevProps } from "^jatev";
import { Main as JagovMain, Props as JagovProps } from "^jagov";
import { getApiPath } from "^jawis-util";

import { JaviDirectorProps } from ".";

/**
 *
 * - server port is default: 80.
 * - mounts jate and jago view.
 *
 * note
 *  - this caters for both production javi and jadev dev sites. (to avoid code duplication.)
 */
export const JaviDirector: React.FC<JaviDirectorProps> = ({
  serverPort,
  postNav,
  routes,
  ...extra
}) => {
  //props

  const jatevProps: JatevProps = useObject({
    ...extra,
    apiPath: getApiPath(serverPort, "jate"),
  });

  const jagovProps: JagovProps = useObject({
    ...extra,
    apiPath: getApiPath(serverPort, "jago"),
  });

  return (
    <ErrorBoundary renderOnError={"Javi failed"}>
      <ComponentMenu
        provideFirstRouteEffect={true}
        postNav={postNav}
        routes={[
          { name: "Tests", elm: <JatevMain {...jatevProps} /> },
          { name: "Scripts", elm: <JagovMain {...jagovProps} /> },
          ...(routes || []),
        ]}
      />
    </ErrorBoundary>
  );
};
