import React from "react";

import { TestProvision } from "^jarun";
import { JagoLogEntry, ServerMessage } from "^jagoc";
import { UseWsEffectArgs } from "^jab-react";
import { renderHook } from "^render-hook";

import { View } from "^jagov/View";
import { useDirector } from "^jagov/useDirector";

import { jcvProps } from ".";

export const getJagoView = () => (
  <View
    processStatus={[
      { id: "scriptId", script: "path/to/script.js", status: "stopped" },
    ]}
    jcvProps={jcvProps}
    apiSend={() => {}}
    useApiSend={() => () => {}}
    wsState={"closed"}
  />
);

/**
 *
 */
export const renderUseJagoDirector = (prov: TestProvision) => {
  let useWsEffectArgs!: UseWsEffectArgs<ServerMessage>;

  //render

  const hookProv = renderHook(useDirector, {
    apiSend: (data) => {
      prov.log("apiSend", data);
    },
    useWsEffect: (data) => {
      //executed sync. Because jago is registers an effect in render.
      useWsEffectArgs = data;
    },
  });

  return { ...hookProv, ...useWsEffectArgs };
};

export const makeJagoSend = (prov: TestProvision) => (msg: JagoLogEntry) => {
  prov.log("postMessage", filterJagoLog(msg));
};

/**
 *
 */
export const filterJagoLog = (entry: JagoLogEntry) => {
  if (entry.type === "error") {
    return {
      ...entry,
      data: { ...entry.data, stack: "filtered" },
    };
  }

  return entry;
};
