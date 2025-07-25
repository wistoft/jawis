import { useCallback, useState } from "react";

import { getPromise, PromiseTriple } from "^yapu";
import { useMemoDep, HookSetState, useAssertStatic } from "^jab-react";
import { WebSocketProv } from "^react-use-ws";

import {
  ClientMessage,
  UseInvoke,
  Invoke,
  makeOnServerMessage,
  ServerMessage,
  State,
  FunctionException,
  FunctionResponse,
} from "./internal";

type DirectorProps = Omit<
  WebSocketProv<ClientMessage, ServerMessage>,
  "wsState"
>;

/**
 *
 */
export const useDirector = ({ apiSend, useWsEffect }: DirectorProps) => {
  // we take hooks, so they must not change.

  useAssertStatic({ useWsEffect });

  // state

  const [_state, setState] = useState<State>({});

  // structure

  const { onServerMessage, useProvision } = useMemoDep(
    { setState, apiSend },
    createStructure
  );

  // web socket

  useWsEffect({ onServerMessage });

  // callback

  const openComponnent = useCallback(
    (compPath: string) => {
      apiSend({ type: "openRelFile", file: compPath });
    },
    [apiSend]
  );

  // done

  return {
    apiSend,
    useProvision,
    openComponnent,
  };
};

//
// util
//

type StructureDeps = {
  apiSend: (data: ClientMessage) => void;
  setState: HookSetState<State>;
};

/**
 *
 */
const createStructure = ({ apiSend }: StructureDeps) => {
  let prom: PromiseTriple<any>;

  const onFunctionResponse = (msg: FunctionResponse) => {
    prom.resolve(msg.value);
  };

  const onFunctionException = (msg: FunctionException) => {
    console.log(msg.error); //todo
    prom.reject(new Error("Function threw on server: " + msg.func));
  };

  const onServerMessage = makeOnServerMessage({
    onFunctionResponse,
    onFunctionException,
  });

  const useProvision: (path: string) => any = (path) => {
    const invoke: Invoke = (func: string, ...args: any[]) => {
      prom = getPromise<any>();

      apiSend({
        type: "call-function",
        id: 7,
        args: JSON.stringify(args),
        func,
        path,
      });

      return prom.promise;
    };

    const useInvoke: UseInvoke = (func: string, ...args: any[]) => {
      const [value, setValue] = useState<any>(undefined);

      invoke(func, ...args).then(setValue);

      return value;
    };

    return {
      invoke,
      useInvoke,
    };
  };

  return {
    onServerMessage,
    useProvision,
  };
};
