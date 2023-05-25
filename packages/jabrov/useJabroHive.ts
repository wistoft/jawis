import { useMemoDep } from "^jab-react";
import { useWebSocketProv } from "^react-use-ws";
import {
  BeeFrostClientMessage,
  BeeFrostServerMessage,
  JabroHive,
  JabroHiveDeps,
} from "./internal";

/**
 *
 */
export const useJabroHive = (apiPath: string) => {
  const { apiSend, useWsEffect } = useWebSocketProv<
    BeeFrostClientMessage,
    BeeFrostServerMessage
  >({
    URL: "ws://" + apiPath + "/ws",
    reconnect: true,
  });

  const onServerMessage = useMemoDep({ apiSend }, createStructure);

  useWsEffect({ onServerMessage });
};

/**
 *
 */
const createStructure = (deps: JabroHiveDeps) => {
  const hive = new JabroHive(deps);

  return hive.onServerMessage;
};
