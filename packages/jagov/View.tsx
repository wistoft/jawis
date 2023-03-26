import React, { memo } from "react";
import { Link, Router } from "@reach/router";

import { JsLink, NoRoute, ReachRoute } from "^jab-react";

import { WsStates } from "^react-use-ws";
import {
  ViewScriptRoute,
  ViewScriptRouteProps,
  ViewHome,
  ViewHomeProps,
} from "./internal";

export type ViewProps = { wsState: WsStates } & ViewHomeProps &
  ViewScriptRouteProps;

/**
 *
 */
export const View: React.FC<ViewProps> = memo(({ wsState, ...extra }) => {
  const restartAll = extra.useApiSend({ type: "restartAll" });
  const stopAll = extra.useApiSend({ type: "stopAll" });

  return (
    <>
      <nav>
        <span style={{ color: "var(--link-color)" }}>
          <Link to="./">Home</Link>,{" "}
          <JsLink name={"restart all"} onClick={restartAll} />,{" "}
          <JsLink name={"stop all"} onClick={stopAll} />
        </span>
        {wsState === "reconnecting" && " " + wsState}
      </nav>
      <Router>
        <ReachRoute path="/" element={<ViewHome {...extra} />} />
        <ReachRoute
          path="/script/:scriptId"
          element={<ViewScriptRoute {...extra} />}
        />
        <NoRoute path="*" />
      </Router>
    </>
  );
});
