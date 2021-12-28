import { State } from "./types";

/**
 *
 */
export const unsetClickedUpdater = (deps: {}) => (): Partial<State> => ({
  clicked: false,
});

export const resetUpdater = (bool: boolean) => (old: State) => ({
  //typescript is not good with spread operator.
  ...old,
  clicked: bool,
});
