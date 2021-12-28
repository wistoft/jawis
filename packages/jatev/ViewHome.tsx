import React, { memo, useEffect } from "react";

import { StateCallbacks, State } from "./types";
import { HelmDirector } from "^util-javi/web/helm";
import { ClientApiSendProv, makeDataProvider } from "./util";
import { WsStates } from "^jab-react";

type Props = {
  state: State;
  callbacks: StateCallbacks;
  apiSend: ClientApiSendProv["apiSend"];
  wsState: WsStates;
};

/**
 * Show a list of all test cases.
 */
export const ViewHome: React.FC<Props> = memo(({ state, apiSend, wsState }) => {
  // this is a little hacky.
  //  this might send too many requests.
  if (state.tests === undefined) {
    if (wsState === "connected") {
      useEffect(() => {
        apiSend({ action: "getAllTests" });
      }, []);
    }
  }

  return (
    <>
      {" "}
      <br />
      To run tests: click <i>cur</i> or <i>all</i>, and reload page.
      <br />
      <br />
      <HelmDirector dataProvider={makeDataProvider(state)} />
    </>
  );
});

ViewHome.displayName = "ViewHome";
