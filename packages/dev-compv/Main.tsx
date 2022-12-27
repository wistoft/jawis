import React, { memo, useCallback } from "react";

// eslint-disable-next-line import/no-extraneous-dependencies
import { ClientMessage, ServerMessage } from "@jawis/jagoc";

import { useKeyListener } from "^jab-react";
import { useWebSocketProv } from "^use-websocket";

import { InnerPanel } from "./InnerPanel";
import { mapWebpackContext } from "./util";

export type ComponentDef = {
  name: string;
  path: string;
  comp: React.ComponentType<unknown> | (() => void);
};

export type Props = {
  apiPath: string;
  contexts: {
    folder: string;
    context: __WebpackModuleApi.RequireContext;
  }[];
};

const noop = () => {};

/**
 *
 */
export const Main: React.FC<Props> = memo(({ apiPath, contexts }) => {
  //connect to jago

  const { apiSend, useWsEffect } = useWebSocketProv<
    ClientMessage,
    ServerMessage
  >({
    URL: "ws://" + apiPath + "/ws",
    reconnect: true,
  });

  useWsEffect({ onServerMessage: noop });

  //callback

  const openComponnent = useCallback(
    (compPath: string) => {
      // const projectRoot = "E:\\work\\repos\\jawis";

      apiSend({ type: "openRelFile", file: compPath });
      // apiSend({ type: "openFile", file: path.join(projectRoot, compPath) });
    },
    [apiSend]
  );

  return (
    <InnerPanel
      folders={contexts.map((elm) => ({
        folder: elm.folder,
        comps: mapWebpackContext(elm.context),
      }))}
      openComponnent={openComponnent}
      useKeyListener={useKeyListener}
    />
  );
});

Main.displayName = "DevComponentPanelMain";
