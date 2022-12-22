import { useState, useMemo } from "react";
import { safeAll } from "^yapu";

import { HookSetState, useMemoDep } from "^jab-react";

import { makeAddDataUpdater } from "./updaters";
import { ConsoleEntry, UiEntry } from ".";

export type State = {
  logs: UiEntry[];
};

export type Callbacks = {
  //external
  addData: (event: ConsoleEntry[], doSourceMap?: boolean) => Promise<unknown>;

  //internal
  clearAllLogs: () => void;
  useToggleEntry: (id: number) => () => void;
  useRemoveEntry: (id: number) => () => void;

  //exported for testing
  onToggleEntry: (id: number) => void;
  removeEntry: (id: number) => void;
};

export type ConsoleStateProv = State & Callbacks;

/**
 *
 */
export const useConsoleState = (
  makeReactKey: () => number,
  logs = [] as UiEntry[]
): ConsoleStateProv => {
  const [state, setState] = useState<State>({ logs });
  const callbacks = useMemoDep({ setState, makeReactKey }, createCallbacks);

  return {
    ...state,
    ...callbacks,
  };
};

//
// util
//

type CallbackDeps = {
  setState: HookSetState<State>;
  makeReactKey: () => number;
};

/**
 *
 */
export const createCallbacks = ({
  setState,
  makeReactKey,
}: CallbackDeps): Callbacks => {
  const addData = (entries: ConsoleEntry[], doSourceMap = false) => {
    //get the logic

    const { sync, asyncs } = makeAddDataUpdater(
      entries,
      makeReactKey,
      doSourceMap
    );

    //the synchronous

    setState(sync);

    // apply the updates, when they resolve

    const mapped = asyncs.map((prom) =>
      prom.then((updater) => {
        setState(updater);
      })
    );

    //return when everything is done. (useful for testing)

    return safeAll(mapped, console.log);
  };

  const clearAllLogs = () => {
    setState((old) => ({ ...old, logs: [] }));
  };

  const removeEntry = (id: number) => {
    setState((old) => ({
      ...old,
      logs: old.logs.filter((elm) => elm.id !== id),
    }));
  };

  //only used locally
  const onToggleEntry = (id: number) => {
    setState((old) => {
      const newLogs = old.logs.map((entry) => ({
        ...entry,
        expandEntry: entry.id === id ? !entry.expandEntry : entry.expandEntry,
      }));
      return { ...old, logs: newLogs };
    });
  };

  const useToggleEntry = (id: number) =>
    useMemo(() => () => onToggleEntry(id), [id]);

  const useRemoveEntry = (id: number) =>
    useMemo(() => () => removeEntry(id), [id]);

  return {
    addData,
    clearAllLogs,
    onToggleEntry,
    removeEntry,
    useToggleEntry,
    useRemoveEntry,
  };
};
