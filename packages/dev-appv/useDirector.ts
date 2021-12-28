import { useMemo, useState } from "react";

import { getRandomInteger } from "^jab";

import {
  useMemoDep,
  makeUseFunction,
  HookSetState,
  makeSetStateCallback,
  WebSocketProv,
  useAssertStatic,
  JabHttpProvider,
  useWebSocketProv,
} from "^jab-react";

import { ClientMessage, ServerMessage } from "^dev-appc";
import { makeOnServerMessage } from "./onServerMessage";
import { State } from "./types";
import { resetUpdater, unsetClickedUpdater } from "./updaters";
import { HttpRequest } from "^dev-appc";

export type Props = {
  apiPath: string;
} & Omit<WebSocketProv<ClientMessage, ServerMessage>, "wsState">;

/**
 *
 */
export const useDirector = ({ apiPath, useWsEffect }: Props) => {
  //we take hooks, so they must not change. React has no semantics for changing hooks.

  useAssertStatic({ useWsEffect });

  //state

  const [state, setState] = useState<State>({
    clicked: false,
  });

  //structure

  const objects = useMemoDep({ apiPath, setState: setState }, createStructure);

  //web socket

  useWsEffect({
    onServerMessage: objects.onServerMessage,
  });

  return {
    ...state,
    ...objects,
  };
};

//
// util
//

type StructureDeps = {
  apiPath: string;
  setState: HookSetState<State>;
};

/**
 *
 */
const createStructure = ({ apiPath, setState }: StructureDeps) => {
  const httpProv = new JabHttpProvider<HttpRequest>("http://" + apiPath);

  const onServerMessage = makeOnServerMessage({});

  const unsetClicked = makeSetStateCallback(unsetClickedUpdater, setState);

  const onClick = () => {
    setState((old) => ({ ...old, clicked: true }));
  };

  const onReset = (bool: boolean) => {
    setState(resetUpdater(bool));
  };

  const useReset = (bool: boolean) =>
    useMemo(() => () => onReset(bool), [bool]);

  return {
    httpProv,
    onServerMessage,
    unsetClicked,
    onClick,
    useReset,
  };
};
