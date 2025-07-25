import React, { memo } from "react";

import { JsLink, Route, Link, NoRouteElement, Routes } from "^jab-react";
import { WsStates } from "^react-use-ws";

import {
  ViewScriptRoute,
  ViewScriptRouteProps,
  ViewHome,
  ViewHomeProps,
} from "./internal";

export type ViewProps = {
  wsState: WsStates;
  restartAll: () => void;
  stopAll: () => void;
} & ViewHomeProps &
  ViewScriptRouteProps;

/**
 *
 */
export const View: React.FC<ViewProps> = memo(({ wsState, ...extra }) => (
  <>
    <nav>
      <span style={{ color: "var(--link-color)" }}>
        <Link to="./">Home</Link>,{" "}
        <JsLink name={"restart all"} onClick={extra.restartAll} />,{" "}
        <JsLink name={"stop all"} onClick={extra.stopAll} />
      </span>
      {wsState === "reconnecting" && " " + wsState}
    </nav>
    <Routes>
      <Route path="/" element={<ViewHome {...extra} />} />
      <Route
        path="/script/:scriptId"
        element={<ViewScriptRoute {...extra} />}
      />
      {NoRouteElement}
    </Routes>
  </>
));

View.displayName = "View";
