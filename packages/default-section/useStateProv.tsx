import { useState, useMemo } from "react";

import { useMemoDep, HookSetState } from "^jab-react";

type State = {
  clicked: boolean;
};

type Callbacks = {
  onClick: () => void;
  useReset: (id: boolean) => () => void;
};

export type StateProv = State & Callbacks;

const defaultInitialState: State = {
  clicked: false,
};

//
// hook
//

export const useStateProv = (
  initial: State = defaultInitialState
): StateProv => {
  const [state, setState] = useState<State>(initial);
  const callbacks = useMemoDep({ setState }, createCallbacks);

  return {
    ...state,
    ...callbacks,
  };
};

//
// methods
//

type CallbackDeps = {
  setState: HookSetState<State>;
};

/**
 *
 */
const createCallbacks = ({ setState }: CallbackDeps): Callbacks => {
  const onClick = () => {
    setState((old) => ({ ...old, clicked: true }));
  };

  const onReset = (bool: boolean) => {
    setState(resetUpdater(bool));
  };

  const useReset = (bool: boolean) =>
    useMemo(() => () => onReset(bool), [bool]);

  return {
    onClick,
    useReset,
  };
};

const resetUpdater = (bool: boolean) => (old: State) => ({
  //typescript is not good with spread operator.
  ...old,
  clicked: bool,
});
