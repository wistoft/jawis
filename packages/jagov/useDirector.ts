import { useState } from "react";

import { getRandomInteger, OpenFile } from "^jab";
import { ConsoleEntry, UseConsoleStream, useConsoleState } from "^console";
import {
  useMemoDep,
  makeUseFunction,
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

export type DirectorProps = {
  useConsoleStream?: UseConsoleStream;
} & Omit<WebSocketProv<ClientMessage, ServerMessage>, "wsState">;

/**
 *
 *  - Used by both in jago view and in the standalone Console.
 */
export const useDirector = ({
  apiSend,
  useWsEffect,
  useConsoleStream,
}: DirectorProps) => {
  // we take hooks, so they must not change.

  useAssertStatic({ useWsEffect, useConsoleStream });

  // console state

  const consoleState = useConsoleState(getRandomInteger);

  //listen to console data from the browser.

  if (useConsoleStream) {
    useConsoleStream((entries) => consoleState.addData(entries, true));
  }

  // state

  const [state, setState] = useState<State>({});

  // structure

  const { useApiSend, onServerMessage, onOpen, openFile } = useMemoDep(
    { apiSend, setState, addConsoleData: consoleState.addData },
    createStructure
  );

  // web socket

  useWsEffect({ onOpen, onServerMessage });

  // done

  return {
    ...state,
    ...consoleState,
    useApiSend,
    openFile,
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
  const callbacks = {
    setProcessStatus: makeSetStateCallback(setProcessStatusUpdater, setState),
  };

  const onOpen = () => {
    apiSend({ type: "startListen" });
  };

  const openFile: OpenFile = (deps: { file: string; line?: number }) => {
    apiSend({
      type: "openFile",
      ...deps,
    });
  };

  const useApiSend = makeUseFunction(apiSend);

  const onServerMessage = makeOnServerMessage({ ...callbacks, addConsoleData });

  return {
    useApiSend,
    onServerMessage,
    onOpen,
    openFile,
  };
};
