import { useState } from "react";

import { getRandomInteger } from "^jab";
import { ConsoleEntry, UseConsoleStream, useConsoleState } from "^console";

import {
  useMemoDep,
  makeUseFunction,
  HookSetState,
  makeSetStateCallback,
  WebSocketProv,
  useAssertStatic,
} from "^jab-react";
import { OpenFile } from "^util-javi";

import { ClientMessage, ServerMessage } from "^jagoc";
import { makeOnServerMessage } from "./onServerMessage";
import { State } from ".";
import { setProcessStatusUpdater } from "./updaters";

export type Props = {
  useConsoleStream?: UseConsoleStream;
} & Omit<WebSocketProv<ClientMessage, ServerMessage>, "wsState">;

/**
 *
 */
export const useDirector = ({
  apiSend,
  useWsEffect,
  useConsoleStream,
}: Props) => {
  //we take hooks, so they must not change. React has no semantics for changing hooks.

  useAssertStatic({ useWsEffect, useConsoleStream });

  //console state

  const consoleState = useConsoleState(getRandomInteger);

  //listen to console data from the browser.

  if (useConsoleStream) {
    useConsoleStream((entries) => consoleState.addData(entries, true));
  }

  //own state

  const [state, setState] = useState<State>({});

  const { useApiSend, onServerMessage, onOpen, openFile } = useMemoDep(
    { setState, apiSend, addConsoleData: consoleState.addData },
    createStructure
  );

  useWsEffect({ onOpen, onServerMessage });

  //done

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
  setState: HookSetState<State>;
  apiSend: (data: ClientMessage) => void;
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

  const onServerMessage = makeOnServerMessage({ ...callbacks, addConsoleData });

  const onOpen = () => {
    apiSend({ type: "startListen" });
  };

  const useApiSend = makeUseFunction(apiSend);

  const openFile: OpenFile = (deps: { file: string; line?: number }) => {
    apiSend({
      type: "openFile",
      ...deps,
    });
  };

  return {
    useApiSend,
    onServerMessage,
    onOpen,
    openFile,
  };
};
