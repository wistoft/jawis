import React from "react";

import { assertNever } from "^jab";
import { JsLink } from "^jab-react";
import { ScriptStatusTypes } from "^jagoc";

import { ApiProv } from ".";

export const getScriptColor = (status: ScriptStatusTypes) => {
  switch (status) {
    case "preloading":
      return "var(--other-red)";

    case "running":
      return "var(--other-green)";

    case "listening":
      return "var(--lilla)";

    case "stopped":
      return "var(--text-color)";

    default:
      return assertNever(status);
  }
};

export const getStopLink = (deps: ApiProv, script: string) => (
  <JsLink
    name="stop"
    onClick={() => deps.apiSend({ type: "stopScript", script })}
  />
);

export const getRestartLink = (deps: ApiProv, script: string) => (
  <JsLink
    name="restart"
    onClick={() => deps.apiSend({ type: "restartScript", script })}
  />
);

export const getEditLink = (deps: ApiProv, script: string) => (
  <JsLink
    name="edit"
    onClick={() => deps.apiSend({ type: "openFile", file: script })}
  />
);
