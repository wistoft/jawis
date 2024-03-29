import "./style.css";

import React from "react";
import { BrowserRouter } from "react-router-dom";

import { ErrorBoundary, useObject, ComponentMenu } from "^jab-react";
import { Main as JatevMain, Props as JatevProps } from "^jatev";
import { Main as JagovMain, Props as JagovProps } from "^jagov";

import { getApiPath, DevTemplate, JaviDirectorProps } from "./internal";

/**
 *
 * - server port is default: 80.
 * - mounts jate and jago view.
 *
 * note
 *  - this caters for both production and dev sites. (to avoid code duplication.)
 *  - only uses DevTemplate to get 'indent'.
 */
export const JaviDirector: React.FC<JaviDirectorProps> = ({
  serverPort,
  consolePanel,
  postNav,
  routes,
  ...extra
}) => {
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
      <DevTemplate
        mainPanel={
          <BrowserRouter>
            <ComponentMenu
              provideFirstRouteEffect={true}
              postNav={postNav}
              routes={[
                { name: "Tests", elm: <JatevMain {...jatevProps} /> },
                { name: "Scripts", elm: <JagovMain {...jagovProps} /> },
                ...(routes || []),
              ]}
            />
          </BrowserRouter>
        }
        consolePanel={consolePanel}
      />
    </ErrorBoundary>
  );
};
