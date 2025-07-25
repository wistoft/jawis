import { State } from "./internal";

/**
 *
 */
export const unsetClickedUpdater = () => (): Partial<State> => ({
  clicked: false,
});

export const resetUpdater = (bool: boolean) => (old: State) => ({
  ...old,
  clicked: bool,
});
