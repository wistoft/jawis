import React from "react";
import { MemoryRouter } from "react-router-dom";

import { TestProvision } from "^jarun";
import { ServerMessage } from "^jagoc";
import { renderHook } from "^render-hook-plus";
import { UseWsEffectArgs } from "^react-use-ws";

import { View, useDirector } from "^jagov/internal";
import { jcvProps } from "./index";

export const getJagoView = () => (
  <MemoryRouter initialEntries={["/"]}>
    <View
      processStatus={[
        { id: "scriptId", script: "path/to/script.js", status: "stopped" },
      ]}
      jcvProps={jcvProps()}
      apiSend={() => {}}
      wsState={"closed"}
      restartAll={() => {}}
      stopAll={() => {}}
    />
  </MemoryRouter>
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
      //executed sync. Because jago registers an effect in render.
      useWsEffectArgs = data;
    },
  });

  return { ...hookProv, ...useWsEffectArgs };
};
