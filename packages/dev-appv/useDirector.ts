import { useMemo, useState } from "react";

import {
  useMemoDep,
  HookSetState,
  makeSetStateCallback,
  useAssertStatic,
} from "^jab-react";
import { WebSocketProv } from "^react-use-ws";

import {
  State,
  makeOnServerMessage,
  ClientMessage,
  ServerMessage,
  resetUpdater,
  unsetClickedUpdater,
} from "./internal";

export type DirectorProps = {
  apiPath: string;
} & Omit<WebSocketProv<ClientMessage, ServerMessage>, "wsState">;

/**
 *
 */
export const useDirector = ({
  apiSend,
  useWsEffect,
  apiPath,
}: DirectorProps) => {
  // we take hooks, so they must not change.

  useAssertStatic({ useWsEffect });

  // state

  const [state, setState] = useState<State>({
    clicked: false,
  });

  // structure

  const objects = useMemoDep({ apiSend, setState, apiPath }, createStructure);

  // web socket

  useWsEffect({
    onServerMessage: objects.onServerMessage,
  });

  // done

  return {
    ...state,
    ...objects,
  };
};

//
// util
//

type StructureDeps = {
  apiSend: (data: ClientMessage) => void;
  setState: HookSetState<State>;
  apiPath: string;
};

/**
 *
 */
const createStructure = ({ apiSend, setState }: StructureDeps) => {
  const unsetClicked = makeSetStateCallback(unsetClickedUpdater, setState);

  const onClick = () => {
    setState((old) => ({ ...old, clicked: true }));
  };

  const onReset = (bool: boolean) => {
    setState(resetUpdater(bool));
  };

  const useReset = (bool: boolean) =>
    useMemo(() => () => onReset(bool), [bool]);

  const onServerMessage = makeOnServerMessage({});

  return {
    onServerMessage,
    unsetClicked,
    onClick,
    useReset,
  };
};
