import { useState } from "react";

import { getRandomInteger, OpenFile } from "^jab";
import { ConsoleEntry, useConsoleState } from "^console";
import {
  useMemoDep,
  HookSetState,
  makeSetStateCallback,
  useAssertStatic,
} from "^jab-react";
import { WebSocketProv } from "^react-use-ws";

import {
  ClientMessage,
  ServerMessage,
  makeOnServerMessage,
  setProcessStatusUpdater,
  State,
} from "./internal";

export type DirectorProps = Omit<
  WebSocketProv<ClientMessage, ServerMessage>,
  "wsState"
>;

/**
 *
 *  - Used by both in jago view and in the standalone Console.
 *  - Shows logs from jago, not from the browser.
 */
export const useDirector = ({ apiSend, useWsEffect }: DirectorProps) => {
  // we take hooks, so they must not change.

  useAssertStatic({ useWsEffect });

  // console state

  const consoleState = useConsoleState(getRandomInteger);

  // state

  const [state, setState] = useState<State>({});

  // structure

  const { onOpen, openFile, restartAll, stopAll, onServerMessage } = useMemoDep(
    { apiSend, setState, addConsoleData: consoleState.addData },
    createStructure
  );

  // web socket

  useWsEffect({ onOpen, onServerMessage });

  // done

  return {
    ...state,
    ...consoleState,
    openFile,
    restartAll,
    stopAll,
  };
};

//
// util
//

type StructureDeps = {
  apiSend: (data: ClientMessage) => void;
  setState: HookSetState<State>;
  addConsoleData: (event: ConsoleEntry[]) => void;
};

/**
 *
 */
const createStructure = ({
  apiSend,
  setState,
  addConsoleData,
}: StructureDeps) => {
  const setProcessStatus = makeSetStateCallback(
    setProcessStatusUpdater,
    setState
  );

  const onOpen = () => {
    apiSend({ type: "startListen" });
  };

  const openFile: OpenFile = (deps: { file: string; line?: number }) => {
    apiSend({
      type: "openFile",
      ...deps,
    });
  };

  const restartAll = () => {
    apiSend({
      type: "restartAll",
    });
  };

  const stopAll = () => {
    apiSend({
      type: "stopAll",
    });
  };

  const onServerMessage = makeOnServerMessage({
    setProcessStatus,
    addConsoleData,
  });

  return {
    restartAll,
    stopAll,
    onServerMessage,
    onOpen,
    openFile,
  };
};
