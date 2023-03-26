import React from "react";

import { TestProvision } from "^jarun";
import { BeeLogEntry } from "^bee-common";
import { ServerMessage } from "^jagoc";
import { UseWsEffectArgs } from "^react-use-ws";
import { renderHook } from "^render-hook-plus";

import { Console } from "^jagov";
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

export const getJagovConsole = () => (
  <Console
    useConsoleStream={() => {
      console.log("use stream");
    }}
    apiPath={"ignored"}
    projectRoot={""}
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

export const makeJagoSend = (prov: TestProvision) => (msg: BeeLogEntry) => {
  prov.log("postMessage", filterJagoLog(msg));
};

/**
 *
 */
export const filterJagoLog = (entry: BeeLogEntry) => {
  if (entry.type === "error") {
    return {
      ...entry,
      data: { ...entry.data, stack: "filtered" },
    };
  }

  return entry;
};
