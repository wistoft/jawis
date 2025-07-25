import React from "react";

import { assertNever } from "^jab";
import { JsLink } from "^jab-react";

import { ScriptStatusTypes, ApiProv, UrlState } from "./internal";

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

export const getStopLink = (apiSend: ApiProv["apiSend"], script: string) => (
  <JsLink name="stop" onClick={() => apiSend({ type: "stopScript", script })} />
);

export const getKillLink = (apiSend: ApiProv["apiSend"], script: string) => (
  <JsLink name="kill" onClick={() => apiSend({ type: "killScript", script })} />
);

export const getRestartLink = (apiSend: ApiProv["apiSend"], script: string) => (
  <JsLink
    name="restart"
    onClick={() =>
      apiSend({
        type: "restartScript",
        script,
        data: urlQueryParamsToJson(),
      })
    }
  />
);

/**
 * can't lie in jab, because this depends on web.
 */
export const urlQueryParamsToJson = () => {
  const tmp = new URLSearchParams(location.search);

  const res: any = {};

  for (const [key, value] of tmp) {
    res[key] = value;
  }

  return res;
};

/**
 * can't lie is jab, because this depends on web.
 */
export const jsonToUrlQueryString = (obj: UrlState) => {
  const tmp = new URLSearchParams();

  for (const [key, value] of Object.entries(obj)) {
    tmp.set(key, value);
  }

  return tmp.toString();
};

export const getEditLink = (apiSend: ApiProv["apiSend"], script: string) => (
  <JsLink
    name="edit"
    onClick={() => apiSend({ type: "openFile", file: script })}
  />
);
