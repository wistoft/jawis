import React from "react";

import { TestProvision } from "^jarun";
import { ServerMessage } from "^jagoc";
import { UseWsEffectArgs } from "^jab-react";
import { renderHookImproved } from "^jawis-mess/node";

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

  const hookProv = renderHookImproved(useDirector, {
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
