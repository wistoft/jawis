import { useEffect, useMemo, useRef, useState } from "react";
import { shallowEqualObjects } from "shallow-equal";
import { JabError } from "^jab";

//
// component set state
//

/**
 *
 */
export type SetStateFunctionCorrect<P, S> = (
  state:
    | (Partial<S> | null)
    | ((old: Readonly<S>, props: Readonly<P>) => Partial<S> | null),
  callback?: () => void
) => void;

//
// hook types
//

export type PartialStateUpdater<D, S> = (
  deps: D
) => Partial<S> | ((old: Readonly<S>) => Partial<S>);

export type PartialStateUpdater2<S> =
  | Partial<S>
  | ((old: Readonly<S>) => Partial<S>);

export type PartialSetState<S> = (
  updater: Partial<S> | ((old: Readonly<S>) => Partial<S>)
) => void;

export type HookSetState<State> = (
  updater: State | ((state: State) => State)
) => void;

//
// hook util
//

/**
 * As `useMemo`, but dependencies are explicit.
 *
 * - Ensures all variables are in the dependency list.
 *
 * note
 *  - It makes little sense to use this function with an inline function declaration.
 *      Because that function will be able to close over variables.
 *  - recreates a little too often. I.e. when keys are reordered, or there's a key with
 *      explicit undefined added/removed.
 */
export const useMemoDep = <Deps extends {}, T>(
  deps: Deps,
  create: (deps: Deps) => T
) =>
  useMemo(() => create(deps), [...Object.keys(deps), ...Object.values(deps)]);

/**
 * Memoize an object. With explicit "dependencies"
 *
 * - Ensures the object is "recreated", if any properties changes value.
 *
 * note
 *  special case of useMemoDep
 */
export const useObject = <T extends {}>(obj: T) =>
  useMemo(() => obj, [...Object.keys(obj), ...Object.values(obj)]);

/**
 * Create a callback based on a partial state updater.
 *
 *  - shallow merge with current state.
 *  - This function is basically the difference between class and hook setState.
 *
 * note
 *  taken deps isn't necessary. It's easy for user to do, but it removes boilerplate in user.
 */
export const makeSetStateCallback =
  <D, S>(updater: PartialStateUpdater<D, S>, setState: HookSetState<S>) =>
  (deps: D) => {
    const upd = updater(deps);

    if (typeof upd === "object") {
      setState((old) => ({ ...old, ...upd }));
    } else {
      setState((old) => ({ ...old, ...upd(old) }));
    }
  };

/**
 * Turn a hook setState into a class setState.
 */
export const makeSetPartialState =
  <S>(setState: HookSetState<S>) =>
  (updater: PartialStateUpdater2<S>) => {
    if (typeof updater === "object") {
      setState((old) => ({ ...old, ...updater }));
    } else {
      setState((old) => ({ ...old, ...updater(old) }));
    }
  };

/**
 * Make a function into a hook.
 *
 * - The hook takes deps at render, and returns a callback, that takes no arguments. A perfect callback function.
 * - Components can use the hook to make referentially stable callbacks.
 */
export const makeUseFunction =
  <D>(func: (deps: D) => void) =>
  (deps: D) =>
    useMemo(() => () => func(deps), [func, ...Object.values(deps)]);

/**
 * Wrap a function, so it's a no-op, after the component has unmounted.
 *
 * - This can be used to wrap Reacts setState, because that mustn't be called after the component has unmounted.
 * - The inner function is called normally, when not unmounted. I.e. also before mount.
 * - Silently stop calling the inner function, when the component has unmounted.
 * - Referentially stable, and recreate the outer function, when the inner changes.
 */
export const useUnmountSafeFunction = <F extends (...a: any[]) => any>(
  func: F
) => {
  //we need state, because useEffect cannot access anything the callback has access to.

  const [holder] = useState<{ unmounted?: boolean }>({});

  // detect unmount.

  useEffect(
    () => () => {
      holder.unmounted = true;
    },
    []
  );

  // wrap the inner function

  return useMemo(
    () =>
      (...args: Parameters<F>): ReturnType<F> | void => {
        if (!holder.unmounted) {
          return func(...args);
        }
      },
    [func]
  );
};

/**
 * Assert that an object is shallowly the same at every render.
 *
 */
export const useAssertStatic = (value: {}) => {
  const [initialValue] = useState(value);

  if (!shallowEqualObjects(initialValue, value)) {
    throw new JabError("Value has changed", initialValue, value);
  }
};

/**
 * Scroll the component into view when it mounts.
 *
 */
export const useScrollIntoView = () => {
  const scrollTarget = useRef<any>();

  useEffect(() => {
    //guard in case it's not attached.
    if (scrollTarget.current) {
      scrollTarget.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return scrollTarget;
};
