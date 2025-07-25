import React, { memo } from "react";
import { useParams } from "react-router-dom";

import { useFirstRouteEffect } from "^jab-react";
import { assertPropString } from "^jab";

import {
  ScriptStatus,
  ApiProv,
  ViewScript,
  ViewScriptProps,
  urlQueryParamsToJson,
} from "./internal";

export type ViewScriptRouteProps = Pick<ApiProv, "apiSend"> &
  Omit<ViewScriptProps, "singleProcessStatus"> & {
    processStatus?: ScriptStatus[];
  };

/**
 *
 * impl
 *  socket is guaranteed to be open, when sending `restartScript`, because processStatus !== undefined.
 */
export const ViewScriptRoute: React.FC<ViewScriptRouteProps> = memo((props) => {
  if (props.processStatus !== undefined) {
    return <ViewScriptRouteInner {...props} />;
  } else {
    return null;
  }
});

ViewScriptRoute.displayName = "ViewScriptRoute";

/**
 *
 */
const ViewScriptRouteInner: React.FC<ViewScriptRouteProps> = memo(
  ({ processStatus, apiSend, jcvProps }) => {
    //get params from url

    const params = useParams();

    const id = assertPropString(params, "scriptId");

    //lookup "props"

    const script = processStatus!.find((x) => x.id === id);

    // restart script "onload"

    useFirstRouteEffect(() => {
      if (script) {
        apiSend({
          type: "restartScript",
          script: script.script,
          data: urlQueryParamsToJson(),
        });
      }
    });

    //render

    if (script) {
      return (
        <ViewScript
          singleProcessStatus={script}
          jcvProps={jcvProps}
          apiSend={apiSend}
        />
      );
    } else {
      return <>Script not found</>;
    }
  }
);

ViewScriptRouteInner.displayName = "ViewScriptRouteInner";
