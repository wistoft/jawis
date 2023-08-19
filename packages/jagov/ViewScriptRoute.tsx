import React, { memo } from "react";

import { useFirstRouteEffect, useParams } from "^jab-react";
import { assertPropString } from "^jab";

import { ScriptStatus } from "^jagoc";

import { ViewScript, ViewScriptProps, ApiProv } from "./internal";

export type ViewScriptRouteProps = ApiProv &
  Omit<ViewScriptProps, "singleProcessStatus"> & {
    processStatus?: ScriptStatus[];
  };

/**
 *
 * impl
 *  socket is guaranteed to be open, when sending `restartScript`, because processStatus !== undefined.
 */
export const ViewScriptRoute: React.FC<ViewScriptRouteProps> = memo(
  ({ processStatus, apiSend, useApiSend, jcvProps }) => {
    if (processStatus === undefined) {
      return null;
    }

    //get params from url

    const params = useParams();

    const id = assertPropString(params, "scriptId");

    //lookup "props"

    const script = processStatus.find((x) => x.id === id);

    // restart script "onload"

    useFirstRouteEffect(() => {
      if (script) {
        apiSend({ type: "restartScript", script: script.script });
      }
    }, []);

    //render

    if (script) {
      return (
        <>
          {
            <ViewScript
              singleProcessStatus={script}
              jcvProps={jcvProps}
              apiSend={apiSend}
              useApiSend={useApiSend}
            />
          }
        </>
      );
    } else {
      return <>Script not found</>;
    }
  }
);

ViewScriptRoute.displayName = "ViewScriptRoute";
