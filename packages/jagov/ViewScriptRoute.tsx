import React, { memo, useContext } from "react";
import { useParams } from "@reach/router";

import { UseFirstRouteEffectContext } from "^jab-react";
import { assertPropString } from "^jab";

import { ScriptStatus } from "^jagoc";

import { ViewScript, Props as Sub1 } from "./ViewScript";
import { ApiProv } from ".";

export type Props = ApiProv &
  Omit<Sub1, "singleProcessStatus"> & {
    processStatus?: ScriptStatus[];
  };

/**
 *
 * impl
 *  socket is guaranteed to be open, when sending `restartScript`, because processStatus !== undefined.
 */
export const ViewScriptRoute: React.FC<Props> = memo(
  ({ processStatus, apiSend, useApiSend, jcvProps }) => {
    if (processStatus === undefined) {
      return null;
    }

    //get params from url

    const params = useParams();

    const id = assertPropString(params, "scriptId");

    //lookup "props"

    const found = processStatus.find((x) => x.id === id);

    // restart script "onload"

    const useFirstRouteEffect = useContext(UseFirstRouteEffectContext);

    useFirstRouteEffect(() => {
      if (found) {
        apiSend({ type: "restartScript", script: found.script });
      }
    }, []);

    //render

    if (found) {
      return (
        <>
          {
            <ViewScript
              singleProcessStatus={found}
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
